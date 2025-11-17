package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/mattermost/mattermost-plugin-starter-template/server/command"
	"github.com/mattermost/mattermost-plugin-starter-template/server/store/kvstore"
	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/mattermost/mattermost/server/public/pluginapi"
	"github.com/mattermost/mattermost/server/public/pluginapi/cluster"
	"github.com/pkg/errors"
)

type Plugin struct {
	plugin.MattermostPlugin
	kvstore           kvstore.KVStore
	client            *pluginapi.Client
	commandClient     command.Command
	backgroundJob     *cluster.Job
	configurationLock sync.RWMutex
	configuration     *configuration
}

func (p *Plugin) isPublicChannel(channelID string) bool {
	channel, err := p.API.GetChannel(channelID)
	if err != nil {
		return false
	}
	return channel.Type == model.ChannelTypeOpen
}

func (p *Plugin) MessageWillBeUpdated(c *plugin.Context, newPost *model.Post, oldPost *model.Post) (*model.Post, string) {
	if p.isPublicChannel(newPost.ChannelId) {
		go p.sendNotificationToSpring("post_updated", newPost.Id, newPost.Message)
	}
	return newPost, ""
}

// 삭제 후 훅 사용 
func (p *Plugin) MessageHasBeenDeleted(c *plugin.Context, post *model.Post) {
	p.API.LogInfo("MessageHasBeenDeleted called", "post_id", post.Id)
	
	if p.isPublicChannel(post.ChannelId) {
		p.API.LogInfo("Sending delete notification to Spring", "post_id", post.Id)
		go p.sendNotificationToSpring("post_deleted", post.Id, "")
	}
}

func (p *Plugin) sendNotificationToSpring(eventType, postId, message string) {
	p.API.LogInfo("Sending notification to Spring", "event_type", eventType, "post_id", postId)
	
	payload := map[string]string{
		"event_type": eventType,
		"post_id":    postId,
		"message":    message,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		p.API.LogError("JSON marshal failed", "error", err.Error())
		return
	}

	resp, err := http.Post("{target_url}", 
		"application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		p.API.LogError("Spring notification failed", "event", eventType, "error", err.Error())
		return
	}
	defer resp.Body.Close()
	
	p.API.LogInfo("Spring notification sent successfully", "event", eventType, "status", resp.StatusCode)
}

func (p *Plugin) OnActivate() error {
	p.client = pluginapi.NewClient(p.API, p.Driver)
	p.kvstore = kvstore.NewKVStore(p.client)
	p.commandClient = command.NewCommandHandler(p.client)

	job, err := cluster.Schedule(p.API, "BackgroundJob", 
		cluster.MakeWaitForRoundedInterval(1*time.Hour), p.runJob)
	if err != nil {
		return errors.Wrap(err, "failed to schedule background job")
	}
	p.backgroundJob = job

	return nil
}

func (p *Plugin) OnDeactivate() error {
	if p.backgroundJob != nil {
		p.backgroundJob.Close()
	}
	return nil
}

func (p *Plugin) ExecuteCommand(c *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	response, err := p.commandClient.Handle(args)
	if err != nil {
		return nil, model.NewAppError("ExecuteCommand", "plugin.command.execute_command.app_error", 
			nil, err.Error(), http.StatusInternalServerError)
	}
	return response, nil
}