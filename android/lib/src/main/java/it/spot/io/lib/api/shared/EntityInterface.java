package it.spot.io.lib.api.shared;

import java.util.List;

/**
 * @author a.rinaldi
 */
public interface EntityInterface<TEntity extends Entity> {

    List<TEntity> get();

    TEntity get(String id);

    TEntity create(TEntity entity);

    TEntity edit(TEntity entity);

    boolean delete(String id);
}
