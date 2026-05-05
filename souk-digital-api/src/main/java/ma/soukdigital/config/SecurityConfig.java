package ma.soukdigital.config;

import lombok.RequiredArgsConstructor;
import ma.soukdigital.security.JwtAuthFilter;
import ma.soukdigital.security.RateLimitFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter   jwtAuthFilter;
    private final RateLimitFilter rateLimitFilter;

    private static final String[] PUBLIC_GET = {
        "/products/**",
        "/categories/**",
        "/vendors/*/storefront",
        "/search/**"
    };

    private static final String[] PUBLIC_ANY = {
        "/health",
        "/actuator/health",
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/auth/**",
        "/payment/cmi/callback"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                    CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                .contentTypeOptions(ct -> {})
                .frameOptions(fo -> fo.deny())
                .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(PUBLIC_ANY).permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, PUBLIC_GET).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
