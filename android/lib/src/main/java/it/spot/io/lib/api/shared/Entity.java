package it.spot.io.lib.api.shared;

/**
 * @author a.rinaldi
 */
public class Entity {

    private String _id;

    // region Construction

    public Entity() {
        super();
    }

    // endregion

    // region Public methods

    public String getId() {
        return this._id;
    }

    public void setId(String id) {
        this._id = id;
    }

    // endregion
}
