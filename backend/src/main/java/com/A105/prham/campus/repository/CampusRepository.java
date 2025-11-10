package com.A105.prham.campus.repository;

import java.util.List;

import com.A105.prham.campus.entity.Campus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CampusRepository extends JpaRepository<Campus, Long> {
	List<Campus> findAll();
}
