package it.spot.io.lib.api.shared;

/**
 * @author a.rinaldi
 */
public class Filters {

    // region Construction

    protected Filters() {
        super();
    }

    public static Filters create() {
        return new Filters();
    }

    // endregion

    // region Public methods

    public Filters addFilter() {
        // TODO - implement filter obj
        return this;
    }

    // endregion
}
