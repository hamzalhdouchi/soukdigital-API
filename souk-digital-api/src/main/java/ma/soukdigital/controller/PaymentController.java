package ma.soukdigital.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import ma.soukdigital.dto.CmiInitResponse;
import ma.soukdigital.dto.PaymentStatusDto;
import ma.soukdigital.entity.TransactionStatus;
import ma.soukdigital.repository.OrderRepository;
import ma.soukdigital.repository.PaymentTransactionRepository;
import ma.soukdigital.service.CmiPaymentService;
import ma.soukdigital.service.MobilePaymentService;
import ma.soukdigital.exception.EntityNotFoundException;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "CMI card payment and Mobile Money")
public class PaymentController {

    private final CmiPaymentService            cmiService;
    private final MobilePaymentService         mobileService;
    private final OrderRepository              orderRepository;
    private final PaymentTransactionRepository txRepository;

    @PostMapping("/cmi/init")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Initiate CMI card payment — returns form params")
    public CmiInitResponse initCmi(@RequestParam UUID orderId,
                                   @AuthenticationPrincipal UserDetails user) {
        return cmiService.initiatePayment(orderId, UUID.fromString(user.getUsername()));
    }

    @PostMapping(value = "/cmi/callback",
                 consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
                 produces = MediaType.TEXT_PLAIN_VALUE)
    @Operation(summary = "CMI payment callback (called by CMI gateway — public)")
    public String cmiCallback(@RequestParam Map<String, String> params) {
        return cmiService.handleCallback(params);
    }

    @PostMapping("/mobile/init")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Initiate Mobile Money payment (stub)")
    public Map<String, String> initMobile(@RequestParam UUID orderId,
                                          @AuthenticationPrincipal UserDetails user) {
        mobileService.initiate(orderId, UUID.fromString(user.getUsername()));
        return Map.of("message", "Paiement Mobile Money initié. En attente de confirmation.");
    }

    @PostMapping("/mobile/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Manually confirm Mobile Money payment (admin)")
    public Map<String, String> confirmMobile(@RequestParam UUID orderId) {
        mobileService.confirmManually(orderId);
        return Map.of("message", "Paiement Mobile Money confirmé.");
    }

    @GetMapping("/order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "Bearer")
    @Operation(summary = "Get payment status for an order")
    public PaymentStatusDto getPaymentStatus(@PathVariable UUID orderId,
                                             @AuthenticationPrincipal UserDetails user) {
        var order = orderRepository.findById(orderId)
            .orElseThrow(() -> new EntityNotFoundException("Commande introuvable."));

        var tx = txRepository.findByOrderId(orderId).stream()
            .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
            .orElse(null);

        return new PaymentStatusDto(
            orderId,
            order.getPaymentStatus(),
            tx != null ? tx.getStatus() : TransactionStatus.PENDING,
            tx != null ? tx.getProvider().name() : order.getPaymentMethod().name(),
            tx != null ? tx.getProviderRef() : null,
            order.getTotal(),
            tx != null ? tx.getCreatedAt() : order.getCreatedAt()
        );
    }
}
