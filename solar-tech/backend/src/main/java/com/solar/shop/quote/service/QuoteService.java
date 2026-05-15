package com.solar.shop.quote.service;

import com.solar.shop.common.dto.PageResponse;
import com.solar.shop.common.exception.ResourceNotFoundException;
import com.solar.shop.quote.dto.QuoteCreateRequest;
import com.solar.shop.quote.dto.QuoteResponse;
import com.solar.shop.quote.dto.QuoteStatusUpdateRequest;
import com.solar.shop.quote.entity.Quote;
import com.solar.shop.quote.entity.QuoteItem;
import com.solar.shop.quote.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class QuoteService {

    private static final List<String> VALID_STATUSES =
            List.of("new", "in_review", "sent", "accepted", "rejected", "converted");

    private final QuoteRepository quoteRepository;

    @Transactional
    public QuoteResponse create(QuoteCreateRequest req) {
        Quote quote = Quote.builder()
                .reference(generateReference())
                .firstName(req.firstName())
                .lastName(req.lastName())
                .email(req.email())
                .phone(req.phone())
                .company(req.company())
                .installationType(req.installationType())
                .consumptionKwh(req.consumptionKwh())
                .location(req.location())
                .budget(req.budget())
                .message(req.message())
                .build();

        if (req.items() != null) {
            req.items().forEach(item -> {
                QuoteItem qi = QuoteItem.builder()
                        .quote(quote)
                        .productId(item.productId())
                        .variantId(item.variantId())
                        .productName(item.productName())
                        .variantLabel(item.variantLabel())
                        .quantity(item.quantity() != null ? item.quantity() : 1)
                        .unitPriceHt(item.unitPriceHt())
                        .build();
                quote.getItems().add(qi);
            });
        }

        return QuoteResponse.from(quoteRepository.save(quote));
    }

    @Transactional(readOnly = true)
    public PageResponse<QuoteResponse> findAll(String status, Pageable pageable) {
        var page = (status != null && !status.isBlank())
                ? quoteRepository.findByStatus(status, pageable)
                : quoteRepository.findAll(pageable);
        return PageResponse.from(page.map(QuoteResponse::from));
    }

    @Transactional(readOnly = true)
    public QuoteResponse findById(Long id) {
        return QuoteResponse.from(quoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found: " + id)));
    }

    @Transactional
    public QuoteResponse updateStatus(Long id, QuoteStatusUpdateRequest req) {
        if (!VALID_STATUSES.contains(req.status())) {
            throw new IllegalArgumentException("Invalid status: " + req.status());
        }
        Quote quote = quoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote not found: " + id));
        quote.setStatus(req.status());
        if (req.adminNotes() != null) {
            quote.setAdminNotes(req.adminNotes());
        }
        return QuoteResponse.from(quoteRepository.save(quote));
    }

    private String generateReference() {
        String month = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        int suffix = ThreadLocalRandom.current().nextInt(1000, 9999);
        String ref = "QT-" + month + "-" + suffix;
        while (quoteRepository.findByReference(ref).isPresent()) {
            suffix = ThreadLocalRandom.current().nextInt(1000, 9999);
            ref = "QT-" + month + "-" + suffix;
        }
        return ref;
    }
}
