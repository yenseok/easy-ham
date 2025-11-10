package com.A105.prham.common.config;

import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
@EnableCaching
public class CacheConfig {

	@Bean
	public CacheManager cacheManager10Min() {
		SimpleCacheManager cacheManager = new SimpleCacheManager();

		List<CaffeineCache> caches = List.of(
			// 이메일 -> Mattermost 사용자 ID 매핑
			new CaffeineCache("mattermostUser", Caffeine.newBuilder()
				.expireAfterWrite(10, TimeUnit.MINUTES)
				.maximumSize(1000)
				.recordStats()
				.build()),

			// 사용자의 팀 목록
			new CaffeineCache("mattermostTeams", Caffeine.newBuilder()
				.expireAfterWrite(10, TimeUnit.MINUTES)
				.maximumSize(1000)
				.recordStats()
				.build()),

			// 팀의 채널 목록
			new CaffeineCache("mattermostTeamChannels", Caffeine.newBuilder()
				.expireAfterWrite(10, TimeUnit.MINUTES)
				.maximumSize(2000)
				.recordStats()
				.build())
		);

		cacheManager.setCaches(caches);
		return cacheManager;
	}
}