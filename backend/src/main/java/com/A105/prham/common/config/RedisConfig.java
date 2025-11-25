package com.A105.prham.common.config;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableCaching
@RequiredArgsConstructor
public class RedisConfig {

	// Redis 직렬화를 위한 ObjectMapper 설정
	@Bean
	public ObjectMapper redisObjectMapper() {
		ObjectMapper mapper = new ObjectMapper();
		mapper.registerModule(new JavaTimeModule());
		mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
		return mapper;
	}

	//RedisTemplate 설정
	@Bean
	public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory, ObjectMapper redisObjectMapper) {
		RedisTemplate<String, Object> template = new RedisTemplate<>();
		template.setConnectionFactory(connectionFactory);

		StringRedisSerializer stringSerializer = new StringRedisSerializer();
		GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer(redisObjectMapper);
		template.setKeySerializer(stringSerializer);
		template.setHashKeySerializer(stringSerializer);
		template.setValueSerializer(jsonSerializer);
		template.setHashValueSerializer(jsonSerializer);

		return template;
	}

	//기본 캐시 매니저(10분 ttl) - mattermost api 용
	@Bean
	@Primary
	public CacheManager cacheManager10Min (RedisConnectionFactory connectionFactory, ObjectMapper redisObjectMapper) {

		RedisCacheConfiguration defaultConfig = createCacheConfig(Duration.ofMinutes(10), redisObjectMapper);

		Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
		cacheConfigs.put("mattermostUser", createCacheConfig(Duration.ofMinutes(10), redisObjectMapper));
		cacheConfigs.put("mattermostTeams", createCacheConfig(Duration.ofMinutes(10), redisObjectMapper));
		cacheConfigs.put("mattermostTeamChannels",  createCacheConfig(Duration.ofMinutes(10), redisObjectMapper));

		return RedisCacheManager.builder(connectionFactory)
			.cacheDefaults(defaultConfig)
			.withInitialCacheConfigurations(cacheConfigs)
			.build();
	}

	//캐시 매니저 5분 - 채널별 최신 공지용
	@Bean
	public CacheManager cacheManager5Min (RedisConnectionFactory connectionFactory, ObjectMapper redisObjectMapper) {

		RedisCacheConfiguration config = createCacheConfig(Duration.ofMinutes(5), redisObjectMapper);

		Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
		cacheConfigs.put("channelRecentPosts", config);
		cacheConfigs.put("userChannelIds", config);

		return RedisCacheManager.builder(connectionFactory)
			.cacheDefaults(config)
			.withInitialCacheConfigurations(cacheConfigs)
			.build();
	}

	//캐시 매니저 1시간 - 통계 데이터용
	@Bean
	public CacheManager cacheManager1Hour (RedisConnectionFactory connectionFactory, ObjectMapper redisObjectMapper) {

		RedisCacheConfiguration config = createCacheConfig(Duration.ofHours(1), redisObjectMapper);

		return RedisCacheManager.builder(connectionFactory)
			.cacheDefaults(config)
			.build();
	}

	private RedisCacheConfiguration createCacheConfig(Duration ttl, ObjectMapper objectMapper) {

		return RedisCacheConfiguration.defaultCacheConfig()
			.entryTtl(ttl)
			.disableCachingNullValues()
			.serializeKeysWith(
				RedisSerializationContext.SerializationPair.fromSerializer(
					new StringRedisSerializer()))
			.serializeValuesWith(
				RedisSerializationContext.SerializationPair.fromSerializer(
					new GenericJackson2JsonRedisSerializer(objectMapper)));
	}
}
