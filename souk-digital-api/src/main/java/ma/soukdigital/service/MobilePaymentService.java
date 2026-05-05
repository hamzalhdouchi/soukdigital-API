package ma.soukdigital.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.soukdigital.entity.*;
import ma.soukdigital.exception.EntityNotFoundException;
import ma.soukdigital.repository.OrderRepository;
import ma.soukdigital.repository.PaymentTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MobilePaymentService {

    private final OrderRepository              orderRepository;
    private final PaymentTransactionRepository txRepository;

    /**
     * Mobile Money (Inwi Money / Orange Money).
     * Currently a stub — operator confirms payment manually or via webhook (future).
     * Creates a PENDING transaction and logs the intent.
     */
    @Transactional
    public void initiate(UUID orderId, UUID userId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Commande introuvable."));

        txRepository.save(PaymentTransaction.builder()
            .order(order)
            .provider(PaymentProvider.MOBILE)
            .amount(order.getTotal())
            .status(TransactionStatus.PENDING)
            .build());

        log.info("[MobileMoney] Paiement initié — orderId={} montant={} MAD buyer={}",
            orderId, order.getTotal(), order.getBuyer().getPhone());
    }

    @Transactional
    public void confirmManually(UUID orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Commande introuvable."));

        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        txRepository.findByOrderId(orderId).stream()
            .filter(tx -> tx.getStatus() == TransactionStatus.PENDING)
            .findFirst()
            .ifPresent(tx -> {
                tx.setStatus(TransactionStatus.SUCCESS);
                txRepository.save(tx);
            });

        log.info("[MobileMoney] Paiement confirmé manuellement — orderId={}", orderId);
    }
}
