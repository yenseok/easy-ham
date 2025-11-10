package com.A105.prham.webhook.controller;


import java.nio.charset.StandardCharsets;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.A105.prham.webhook.entity.File;
import com.A105.prham.webhook.repository.FileRepository;
import com.A105.prham.webhook.service.MattermostFileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
public class FileDownloadController {

	private final MattermostFileService fileService;
	private final FileRepository fileRepository;

	@GetMapping("/download/{mmFileId}")
	public ResponseEntity<byte[]> downloadFile(@PathVariable String mmFileId) {
		File fileInfo = fileRepository.findByMmFileId(mmFileId)
			.orElseThrow(() -> new RuntimeException("파일 찾을 수 없다"));

		byte[] fileData = fileService.getFileData(mmFileId);
		if (fileData == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
		}

		HttpHeaders headers = new HttpHeaders();

		headers.setContentDisposition(ContentDisposition.builder("attachment")
			.filename(fileInfo.getFileName(), StandardCharsets.UTF_8)
			.build());

		headers.setContentType(MediaType.parseMediaType(fileInfo.getMimeType()));
		headers.setContentLength(fileData.length);

		return new ResponseEntity<>(fileData, headers, HttpStatus.OK);

	}
}
