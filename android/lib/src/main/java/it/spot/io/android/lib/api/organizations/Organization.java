package it.spot.io.android.lib.api.organizations;

/**
 * @author a.rinaldi
 */
public class Organization {

    protected String name;

    // region Construction

    public Organization() {
        super();
    }

    // endregion

    // region Public methods

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // endregion
}
