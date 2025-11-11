package com.A105.prham.classification.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JobPostingParseResponseDto {
	private List<SingleJobPosting> jobPostings;

	@Getter
	@Builder
	public static class SingleJobPosting {
		private String company;
		private String position;
		private String positionCategory;
		private String deadline;
		private String url;
		private List<String> keywords;
	}
}
