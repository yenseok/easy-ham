package com.A105.prham.classification.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LlmClassificationResult {
	private String title;
	private String mainCategory;
	private String subCategory;
	private String deadline;
	private List<String> campusList;
}
