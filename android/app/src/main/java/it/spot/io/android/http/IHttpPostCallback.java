package it.spot.io.android.http;

/**
 * This is the interface for the callback of a Http POST request.</br>
 * It defines the methods (currently only one) necessary to handle the response.</br>
 * It's generic in {@code T}, as it should be the model mapping the server's response.
 *
 * @author Andrea Corzani
 */
public interface IHttpPostCallback<T> {

    /**
     * This methods gets called after an Http POST request.</br>
     * It handles the result, dispatching it if needed or notifying listeners.
     *
     * @param result the result of the POST request
     */
    public void exec(final T result);
}
