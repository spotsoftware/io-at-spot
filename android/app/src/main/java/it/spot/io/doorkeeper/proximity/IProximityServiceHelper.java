package it.spot.io.doorkeeper.proximity;

/**
 * @author Andrea Corzani
 */
public interface IProximityServiceHelper {

    public boolean adapterIsOff();

    /**
     * This method allows to know the state of the system service wrapped by the helper.
     *
     * @return a {@code boolean} which indicates if the system service is active or not.
     */
    public boolean isActive();

    public void stop();

    public void pause();

    public void resume();
}
