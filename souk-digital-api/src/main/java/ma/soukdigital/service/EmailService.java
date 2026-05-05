package ma.soukdigital.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.soukdigital.entity.Order;
import ma.soukdigital.entity.User;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private static final String FROM    = "Souk Digital <noreply@soukdigital.ma>";
    private static final Locale LOCALE  = Locale.FRENCH;

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Async
    public void sendOrderConfirmation(Order order) {
        String to = order.getBuyer().getEmail();
        if (to == null || to.isBlank()) return;

        Context ctx = new Context(LOCALE);
        ctx.setVariable("order", order);
        ctx.setVariable("items", order.getItems());
        ctx.setVariable("address", order.getDeliveryAddress());

        String subject = "Souk Digital — Commande #" + order.getId().toString().substring(0, 8).toUpperCase() + " confirmée";
        send(to, subject, "email/order-confirmation", ctx);
    }

    @Async
    public void sendWelcomeEmail(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) return;

        Context ctx = new Context(LOCALE);
        ctx.setVariable("user", user);

        String subject = "Bienvenue sur Souk Digital, " + user.getFirstName() + " !";
        send(user.getEmail(), subject, "email/welcome", ctx);
    }

    @Async
    public void sendOtpEmail(String email, String code) {
        if (email == null || email.isBlank()) return;

        Context ctx = new Context(LOCALE);
        ctx.setVariable("code", code);

        send(email, "Votre code de vérification Souk Digital", "email/otp", ctx);
    }

    // ── Internal ──────────────────────────────────────────────

    private void send(String to, String subject, String template, Context ctx) {
        try {
            String html = templateEngine.process(template, ctx);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.debug("Email sent to {} — subject: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
