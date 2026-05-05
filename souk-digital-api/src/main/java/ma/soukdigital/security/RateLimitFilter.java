package ma.soukdigital.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int      MAX_REQUESTS = 5;
    private static final Duration WINDOW       = Duration.ofSeconds(60);
    private static final String   PREFIX       = "rate_limit:";

    private final StringRedisTemplate redis;
    private final ObjectMapper        objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getServletPath().startsWith("/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String ip  = resolveIp(request);
        String key = PREFIX + ip + ":" + request.getServletPath();

        Long count = redis.opsForValue().increment(key);
        if (count == 1) {
            redis.expire(key, WINDOW);
        }

        if (count != null && count > MAX_REQUESTS) {
            log.warn("Rate limit exceeded for IP {} on {}", ip, request.getServletPath());
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(),
                Map.of("error", "Too many requests", "retryAfterSeconds", 60));
            return;
        }

        chain.doFilter(request, response);
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].strip();
        }
        return request.getRemoteAddr();
    }
}
