package it.spot.io.android.proximity;

/**
 * @author Andrea Corzani
 */
public interface IProximityServiceHelper {

    boolean adapterIsOff();

    /**
     * This method allows to know the state of the system service wrapped by the helper.
     *
     * @return a {@code boolean} which indicates if the system service is active or not.
     */
    boolean isActive();

    void stop();

    void pause();

    void resume();
}
