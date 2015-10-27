package it.spot.io.lib.api.shared;

import android.content.Context;

import java.util.List;

/**
 * @author a.rinaldi
 */
public abstract class EntityClient<TEntity extends Entity, T extends EntityInterface<TEntity>>
        extends Client<T> {

    // region Construction

    protected EntityClient(Context context) {
        super(context);
    }

    // endregion

    // region Public methods

    public List<TEntity> get(Filters filters) {
        return this.mApiInterface.get();
    }

    public TEntity get(String id) {
        return this.mApiInterface.get(id);
    }

    public TEntity create(TEntity entity) {
        return this.mApiInterface.create(entity);
    }

    public TEntity edit(TEntity entity) {
        return this.mApiInterface.edit(entity);
    }

    public boolean delete(String id) {
        return this.mApiInterface.delete(id);
    }

    // endregion

    // region Protected methods

    protected abstract Class<T> getApiInterface();

    // endregion
}
