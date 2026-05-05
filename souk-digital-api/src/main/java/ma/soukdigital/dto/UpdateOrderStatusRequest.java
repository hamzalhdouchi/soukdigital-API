package ma.soukdigital.dto;

import jakarta.validation.constraints.NotNull;
import ma.soukdigital.entity.OrderStatus;

public record UpdateOrderStatusRequest(@NotNull OrderStatus status) {}
