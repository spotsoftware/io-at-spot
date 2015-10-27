package it.spot.io.app.login.auth;

import android.util.Patterns;

/**
 * This is a class with static utility methods for user authentication.
 *
 * @author Andrea Corzani
 */
public class AuthUtils {

    /**
     * This method tells if the given email address is valid.</br>
     *
     * @param email the address to validate
     * @return a {@code boolean} which indicates if the email is valid or not
     */
    public static boolean isEmailValid(final String email) {
        return Patterns.EMAIL_ADDRESS.matcher(email).matches();
    }

    /**
     * This method tells if the given password is valid.
     *
     * @param password the password
     * @return a {@code boolean} which indicates if the provided password is valid or not
     */
    public static boolean isPasswordValid(final String password) {
        return password.length() >= 4;
    }
}
