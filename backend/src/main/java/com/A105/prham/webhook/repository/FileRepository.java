package com.A105.prham.webhook.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.A105.prham.webhook.entity.File;

public interface FileRepository extends JpaRepository<File,Long> {

	//mattermost 파일 id로 조회
	Optional<File> findByMmFileId(String mmFileId);

	// post 안에 있는 모든 파일 조회
	List<File> findByPostId(Long postId);

	// 파일 id 존재하는가
	boolean existsByMmFileId(String mmFileId);

}
