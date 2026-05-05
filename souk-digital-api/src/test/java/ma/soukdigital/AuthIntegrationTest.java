package ma.soukdigital;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc     mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void register_withValidData_returns201() throws Exception {
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody("+212600111001", "register.test@test.ma")))
            .andExpect(status().isCreated());
    }

    @Test
    void register_withDuplicatePhone_returns400() throws Exception {
        String phone = "+212600111002";
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody(phone, "first@test.ma")))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody(phone, "second@test.ma")))
            .andExpect(status().isBadRequest());
    }

    @Test
    void login_withUnverifiedAccount_returns403() throws Exception {
        String phone = "+212600111003";
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerBody(phone, "unverified@test.ma")))
            .andExpect(status().isCreated());

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginBody(phone)))
            .andExpect(status().isForbidden());
    }

    @Test
    void getMyOrders_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/orders/my"))
            .andExpect(status().isUnauthorized());
    }

    // ── Helpers ───────────────────────────────────────────────

    private String registerBody(String phone, String email) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
            "firstName", "Test",
            "lastName",  "User",
            "phone",     phone,
            "email",     email,
            "password",  "Password123!"
        ));
    }

    private String loginBody(String identifier) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
            "identifier", identifier,
            "password",   "Password123!"
        ));
    }
}
