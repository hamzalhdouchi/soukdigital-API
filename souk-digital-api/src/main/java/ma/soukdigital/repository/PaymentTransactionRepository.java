package ma.soukdigital.repository;

import ma.soukdigital.entity.PaymentTransaction;
import ma.soukdigital.entity.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {

    List<PaymentTransaction> findByOrderId(UUID orderId);

    List<PaymentTransaction> findByOrderIdAndStatus(UUID orderId, TransactionStatus status);
}




