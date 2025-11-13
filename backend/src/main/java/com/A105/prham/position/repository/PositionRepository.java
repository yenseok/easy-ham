package com.A105.prham.position.repository;

import java.util.Optional;

import com.A105.prham.position.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {

	// position 이름으로 조회
	Optional<Position> findByPositionName(String positionName);
}
