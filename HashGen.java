public class HashGen {
    public static void main(String[] args) throws Exception {
        // Simple BCrypt implementation using Spring Boot fat jar
        // We'll use reflection to call BCryptPasswordEncoder
        String jarPath = args[0];
        java.net.URL url = new java.io.File(jarPath).toURI().toURL();
        java.net.URLClassLoader cl = new java.net.URLClassLoader(
            new java.net.URL[]{url}, ClassLoader.getSystemClassLoader()
        );
        Class<?> enc = cl.loadClass("org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder");
        Object instance = enc.getConstructor(int.class).newInstance(12);
        String hash = (String) enc.getMethod("encode", CharSequence.class).invoke(instance, "Admin@1234");
        System.out.println(hash);
        cl.close();
    }
}
