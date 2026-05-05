package ma.soukdigital.service;

import ma.soukdigital.dto.DeliveryAddressRequest;
import ma.soukdigital.dto.OrderItemRequest;
import ma.soukdigital.dto.PlaceOrderRequest;
import ma.soukdigital.entity.*;
import ma.soukdigital.exception.InsufficientStockException;
import ma.soukdigital.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock OrderRepository     orderRepository;
    @Mock ProductRepository   productRepository;
    @Mock PromoCodeRepository promoCodeRepository;
    @Mock UserRepository      userRepository;
    @Mock VendorRepository    vendorRepository;
    @Mock EmailService        emailService;

    private OrderService orderService;

    private UUID   buyerId;
    private User   buyer;
    private Vendor vendor;
    private Product product;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(
            orderRepository, productRepository, promoCodeRepository,
            userRepository, vendorRepository, emailService);

        buyerId = UUID.randomUUID();
        buyer   = User.builder().id(buyerId).firstName("Fatima").lastName("Benali")
            .email("fatima@test.ma").phone("+212600000002").role(Role.BUYER).build();

        vendor = Vendor.builder().id(UUID.randomUUID()).name("Artisan Maroc")
            .slug("artisan-maroc").user(buyer).build();

        product = Product.builder()
            .id(UUID.randomUUID()).name("Tajine").nameAr("طاجين")
            .slug("tajine").price(BigDecimal.valueOf(150)).stockCount(10)
            .isActive(true).vendor(vendor).build();

        when(userRepository.findById(buyerId)).thenReturn(Optional.of(buyer));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));

        Order saved = Order.builder()
            .id(UUID.randomUUID()).buyer(buyer).status(OrderStatus.CONFIRMED)
            .paymentMethod(PaymentMethod.COD).paymentStatus(PaymentStatus.PENDING)
            .subtotal(BigDecimal.valueOf(150)).discountAmount(BigDecimal.ZERO)
            .deliveryFee(BigDecimal.valueOf(35)).total(BigDecimal.valueOf(185))
            .deliveryAddress(new DeliveryAddress("Fatima","Benali","+212600000002","Rue Hassan II","Casablanca","20000"))
            .build();
        when(orderRepository.save(any())).thenReturn(saved);
        doNothing().when(emailService).sendOrderConfirmation(any());
    }

    @Test
    void placeOrder_withValidCodItem_createsConfirmedOrder() {
        var result = orderService.placeOrder(buildRequest(1, null), buyerId);

        assertThat(result).isNotNull();
        verify(orderRepository).save(any(Order.class));
        verify(emailService).sendOrderConfirmation(any());
    }

    @Test
    void placeOrder_withInsufficientStock_throwsException() {
        product.setStockCount(0);

        assertThatThrownBy(() -> orderService.placeOrder(buildRequest(1, null), buyerId))
            .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    void placeOrder_subtotalUnder300_chargesDeliveryFee35() {
        // price=150 * qty=1 = 150 < 300 → fee = 35
        var result = orderService.placeOrder(buildRequest(1, null), buyerId);

        assertThat(result.deliveryFee()).isEqualByComparingTo(BigDecimal.valueOf(35));
    }

    @Test
    void placeOrder_subtotalOver300_zeroDeliveryFee() {
        // price=150 * qty=3 = 450 ≥ 300 → fee = 0
        Order freeDelivery = Order.builder()
            .id(UUID.randomUUID()).buyer(buyer).status(OrderStatus.CONFIRMED)
            .paymentMethod(PaymentMethod.COD).paymentStatus(PaymentStatus.PENDING)
            .subtotal(BigDecimal.valueOf(450)).discountAmount(BigDecimal.ZERO)
            .deliveryFee(BigDecimal.ZERO).total(BigDecimal.valueOf(450))
            .deliveryAddress(new DeliveryAddress("F","B","+212600000002","Rue","Casa","20000"))
            .build();
        when(orderRepository.save(any())).thenReturn(freeDelivery);

        var result = orderService.placeOrder(buildRequest(3, null), buyerId);

        assertThat(result.deliveryFee()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void placeOrder_withValidPromoCode_appliesDiscount() {
        PromoCode promo = PromoCode.builder()
            .id(UUID.randomUUID()).code("SOUK10")
            .discountPercent(BigDecimal.valueOf(10))
            .usedCount(0).isActive(true).build();
        when(promoCodeRepository.findByCodeIgnoreCaseAndIsActiveTrue("SOUK10"))
            .thenReturn(Optional.of(promo));

        Order discounted = Order.builder()
            .id(UUID.randomUUID()).buyer(buyer).status(OrderStatus.CONFIRMED)
            .paymentMethod(PaymentMethod.COD).paymentStatus(PaymentStatus.PENDING)
            .subtotal(BigDecimal.valueOf(150)).discountAmount(BigDecimal.valueOf(15))
            .deliveryFee(BigDecimal.valueOf(35)).total(BigDecimal.valueOf(170))
            .promoCode("SOUK10")
            .deliveryAddress(new DeliveryAddress("F","B","+212600000002","Rue","Casa","20000"))
            .build();
        when(orderRepository.save(any())).thenReturn(discounted);

        var result = orderService.placeOrder(buildRequest(1, "SOUK10"), buyerId);

        assertThat(result.promoCode()).isEqualTo("SOUK10");
        assertThat(result.discountAmount()).isEqualByComparingTo(BigDecimal.valueOf(15));
    }

    // ── Helpers ───────────────────────────────────────────────

    private PlaceOrderRequest buildRequest(int qty, String promoCode) {
        var address = new DeliveryAddressRequest("Fatima","Benali","+212600000002","Rue Hassan II","Casablanca","20000");
        var item    = new OrderItemRequest(product.getId(), qty);
        return new PlaceOrderRequest(List.of(item), address, PaymentMethod.COD, promoCode);
    }
}
