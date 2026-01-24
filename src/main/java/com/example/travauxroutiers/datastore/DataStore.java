package com.example.travauxroutiers.datastore;

import java.util.Optional;

/**
 * Minimal abstraction for a backend data store (Firebase or JPA).
 * Implementations should provide concrete CRUD operations as needed.
 */
public interface DataStore {
    /** Simple health check or initialization hook. */
    void ping();

    /** Example generic read operation stub. */
    <T> Optional<T> findById(Class<T> type, String id);

    /** Example generic save operation stub. */
    <T> T save(String collection, T entity);
}
