import { useState, useEffect } from 'react';
import { SlackConfig } from '../types';
import { fetchSlackConfig, updateSlackConfig } from '../utils/api';

const SlackSettings = () => {
  const [config, setConfig] = useState<SlackConfig>({ webhookUrl: '', channel: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      const data = await fetchSlackConfig();
      setConfig(data);
      setIsLoading(false);
    };

    loadConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      await updateSlackConfig(config);
      setMessage('設定を保存しました');
    } catch (error) {
      setMessage('エラーが発生しました');
      console.error('Error saving Slack configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="slack-settings">
      <h2>Slack設定</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="webhookUrl">Webhook URL:</label>
          <input
            type="text"
            id="webhookUrl"
            name="webhookUrl"
            value={config.webhookUrl}
            onChange={handleChange}
            placeholder="https://hooks.slack.com/services/..."
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="channel">チャンネル名:</label>
          <input
            type="text"
            id="channel"
            name="channel"
            value={config.channel}
            onChange={handleChange}
            placeholder="#general"
          />
          <small>空白の場合、Webhook URLのデフォルトチャンネルが使用されます</small>
        </div>
        <button type="submit" disabled={isSaving}>
          {isSaving ? '保存中...' : '保存'}
        </button>
        {message && <div className="message">{message}</div>}
      </form>
    </div>
  );
};

export default SlackSettings;