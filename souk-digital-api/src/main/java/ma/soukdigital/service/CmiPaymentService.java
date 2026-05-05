package ma.soukdigital.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.soukdigital.dto.CmiInitResponse;
import ma.soukdigital.entity.*;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.repository.OrderRepository;
import ma.soukdigital.repository.PaymentTransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CmiPaymentService {

    private final OrderRepository              orderRepository;
    private final PaymentTransactionRepository txRepository;
    private final ObjectMapper                 objectMapper;

    @Value("${cmi.merchant-id}") private String merchantId;
    @Value("${cmi.store-key}")   private String storeKey;
    @Value("${cmi.gateway-url}") private String gatewayUrl;
    @Value("${cmi.ok-url}")      private String okUrl;
    @Value("${cmi.fail-url}")    private String failUrl;
    @Value("${cmi.callback-url}") private String callbackUrl;

    @Transactional
    public CmiInitResponse initiatePayment(UUID orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Commande introuvable."));

        if (!order.getBuyer().getId().equals(userId)) {
            throw new AccessDeniedException("Accès refusé.");
        }

        String amount = order.getTotal().setScale(2, RoundingMode.HALF_UP).toPlainString();
        String buyerName = order.getBuyer().getFirstName() + " " + order.getBuyer().getLastName();
        DeliveryAddress addr = order.getDeliveryAddress();

        // Build params (sorted alphabetically for HMAC)
        TreeMap<String, String> params = new TreeMap<>();
        params.put("BillToAddrCity",        addr != null ? addr.getCity() : "");
        params.put("BillToName",            buyerName);
        params.put("TelVoiceAuthorization", order.getBuyer().getPhone() != null ? order.getBuyer().getPhone() : "");
        params.put("amount",                amount);
        params.put("callbackUrl",           callbackUrl);
        params.put("clientid",              merchantId);
        params.put("currency",              "504");
        params.put("failUrl",               failUrl);
        params.put("lang",                  "fr");
        params.put("oid",                   orderId.toString());
        params.put("okUrl",                 okUrl);
        params.put("storetype",             "3D_PAY_HOSTING");
        params.put("trantype",              "PreAuth");

        String hash = computeHmac(params);
        params.put("hash", hash);

        // Record pending transaction
        txRepository.save(PaymentTransaction.builder()
            .order(order)
            .provider(PaymentProvider.CMI)
            .amount(order.getTotal())
            .status(TransactionStatus.PENDING)
            .build());

        return new CmiInitResponse(gatewayUrl, params);
    }

    @Transactional
    public String handleCallback(Map<String, String> params) {
        String rawJson = toJson(params);
        log.info("[CMI Callback] {}", rawJson);

        String oid         = params.get("oid");
        String response    = params.get("Response");
        String transId     = params.get("TransId");
        String incomingHash = params.getOrDefault("hash", "");

        // Verify HMAC (exclude "hash" key for verification)
        TreeMap<String, String> toVerify = new TreeMap<>(params);
        toVerify.remove("hash");
        String expectedHash = computeHmac(toVerify);
        if (!expectedHash.equalsIgnoreCase(incomingHash)) {
            log.warn("[CMI] HMAC mismatch — possible tampering for oid={}", oid);
            return "ACTION=POSTAUTH";
        }

        try {
            UUID orderId = UUID.fromString(oid);
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null) return "ACTION=POSTAUTH";

            List<PaymentTransaction> txList = txRepository.findByOrderIdAndStatus(
                orderId, TransactionStatus.PENDING);
            PaymentTransaction tx = txList.isEmpty() ? null : txList.get(0);

            if ("Approved".equalsIgnoreCase(response)) {
                order.setPaymentStatus(PaymentStatus.PAID);
                order.setStatus(OrderStatus.CONFIRMED);
                if (tx != null) {
                    tx.setStatus(TransactionStatus.SUCCESS);
                    tx.setProviderRef(transId);
                    tx.setRawResponse(rawJson);
                    txRepository.save(tx);
                }
            } else {
                order.setPaymentStatus(PaymentStatus.FAILED);
                if (tx != null) {
                    tx.setStatus(TransactionStatus.FAILED);
                    tx.setRawResponse(rawJson);
                    txRepository.save(tx);
                }
            }
            orderRepository.save(order);
        } catch (Exception e) {
            log.error("[CMI] Callback error: {}", e.getMessage(), e);
        }

        return "ACTION=POSTAUTH";
    }

    // ── Helpers ───────────────────────────────────────────────

    private String computeHmac(TreeMap<String, String> params) {
        // CMI HMAC: concatenate sorted values separated by "|", then HMAC-SHA256
        String data = String.join("|", params.values());
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(storeKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : raw) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Erreur calcul HMAC CMI", e);
        }
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return obj.toString();
        }
    }
}
