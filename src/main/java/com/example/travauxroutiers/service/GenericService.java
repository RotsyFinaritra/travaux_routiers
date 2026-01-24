package com.example.travauxroutiers.service;

import java.util.List;
import java.util.Optional;

public interface GenericService<T, ID> {
    List<T> listAll();
    Optional<T> get(ID id);
    T create(T t);
    T update(ID id, T t);
    void delete(ID id);
}
