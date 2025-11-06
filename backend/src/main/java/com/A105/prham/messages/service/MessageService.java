package com.A105.prham.messages.service;

import com.A105.prham.messages.dto.ProcessedMessage;
import com.A105.prham.messages.entity.Message;
import com.A105.prham.messages.repository.MessageRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public void saveMessage(ProcessedMessage processedMessage) {
        try {
            // 중복 체크
            if (messageRepository.existsByPostId(processedMessage.getPostId())) {
                log.info("Message already exists: {}", processedMessage.getPostId());
                return;
            }

            // ProcessedMessage -> Entity 변환
            Message entity = convertToEntity(processedMessage);

            // 저장
            messageRepository.save(entity);
            log.info("Message saved to database: {}", processedMessage.getPostId());

        } catch (Exception e) {
            log.error("Failed to save message: {}", processedMessage.getPostId(), e);
            throw new RuntimeException("Database save failed", e);
        }
    }

    private Message convertToEntity(ProcessedMessage processed) {
        Message entity = new Message();
        entity.setPostId(processed.getPostId());
        entity.setChannelId(processed.getChannelId());
        entity.setUserId(processed.getUserId());
        entity.setTimestamp(processed.getTimestamp());  // Long 타입 그대로 저장
        entity.setOriginalText(processed.getOriginalText());
        entity.setCleanedText(processed.getCleanedText());
        entity.setDeadline(processed.getDeadline());
        entity.setProcessedAt(processed.getProcessedAt());
        // 카테고리 정보는 Message Entity에 필드가 없다면 저장하지 않음
        // 필요시 Message Entity에도 카테고리 필드 추가 필요

        return entity;
    }

    // 검색 메서드들
    public List<Message> searchByKeyword(String keyword) {
        return messageRepository.findByCleanedTextContainingIgnoreCaseOrderByCreatedAtDesc(keyword);
    }

    public List<Message> findByChannel(String channelId) {
        return messageRepository.findByChannelIdOrderByCreatedAtDesc(channelId);
    }

    public List<Message> findUpcomingDeadlines() {
        return messageRepository.findByDeadlineIsNotNullOrderByDeadlineAsc();
    }

    // Meilisearch 재인덱싱을 위한 메서드 추가
    public List<Message> findAll() {
        return messageRepository.findAll();
    }

    // Message Entity를 ProcessedMessage로 변환하는 메서드 (재인덱싱용)
    public ProcessedMessage convertToProcessedMessage(Message message) {
        ProcessedMessage processed = new ProcessedMessage();
        processed.setPostId(message.getPostId());
        processed.setChannelId(message.getChannelId());
        processed.setUserId(message.getUserId());
        processed.setTimestamp(message.getTimestamp());  // Long 타입 그대로 복사
        processed.setOriginalText(message.getOriginalText());
        processed.setCleanedText(message.getCleanedText());
        processed.setDeadline(message.getDeadline());
        processed.setProcessedAt(message.getProcessedAt());
        // 카테고리는 Message Entity에 없다면 null
        processed.setMainCategory(null);
        processed.setSubCategory(null);

        return processed;
    }
}