package com.example.travauxroutiers.repository;

import com.example.travauxroutiers.model.Signalement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SignalementRepository extends JpaRepository<Signalement, Long> {
	Optional<Signalement> findByFirebaseDocId(String firebaseDocId);

	/**
	 * Returns signalements filtered by validation status name.
	 * Special case: when statusName is 'PENDING', includes rows where validation is missing.
	 */
	@Query("""
			select s
			from Signalement s
			left join s.validation v
			left join v.status vs
			where (
				(:statusName = 'PENDING' and v is null)
				or (vs.name = :statusName)
			)
			""")
	List<Signalement> findByValidationStatusName(@Param("statusName") String statusName);
}
