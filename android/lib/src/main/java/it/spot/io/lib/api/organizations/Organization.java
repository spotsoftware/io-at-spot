package it.spot.io.lib.api.organizations;

import it.spot.io.lib.api.shared.Entity;

/**
 * @author a.rinaldi
 */
public class Organization
        extends Entity {

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
