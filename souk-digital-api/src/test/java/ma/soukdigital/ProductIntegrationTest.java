package ma.soukdigital;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProductIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;

    @Test
    void getProducts_public_returns200() throws Exception {
        mockMvc.perform(get("/products"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }

    @Test
    void getProductBySlug_notFound_returns404() throws Exception {
        mockMvc.perform(get("/products/this-slug-does-not-exist"))
            .andExpect(status().isNotFound());
    }

    @Test
    void createProduct_withoutToken_returns401() throws Exception {
        mockMvc.perform(post("/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void getCategories_public_returns200() throws Exception {
        mockMvc.perform(get("/categories"))
            .andExpect(status().isOk());
    }

    @Test
    void search_public_returns200() throws Exception {
        mockMvc.perform(get("/search").param("q", "tajine"))
            .andExpect(status().isOk());
    }

    @Test
    void adminRoute_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/admin/stats"))
            .andExpect(status().isUnauthorized());
    }
}
