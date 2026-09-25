import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/config/brand';
import { useSessionStore } from '@/shared/auth/session.store';
import { AppText, Badge, Button, QueryBoundary, Screen, TextField } from '@/shared/ui';
import { showError } from '@/shared/utils/feedback';
import { formatDateTime } from '@/shared/utils/format';
import { useReplyToTicket, useTicket } from './hooks';
import { isTicketClosed, ticketStatusLabel, ticketStatusTone } from './labels';

export function TicketChatScreen({ ticketId }: { ticketId: string }) {
  const query = useTicket(ticketId);
  const reply = useReplyToTicket(ticketId);
  const userId = useSessionStore((state) => state.user?.userId);
  const [text, setText] = useState('');

  const send = () =>
    reply.mutate(text.trim(), {
      onSuccess: () => setText(''),
      onError: (error) => showError(error, 'Could not send your message'),
    });

  return (
    <QueryBoundary query={query}>
      {({ ticket, messages }) => (
        <Screen
          footer={
            isTicketClosed(ticket.status) ? (
              <AppText color="textMuted">This request is closed.</AppText>
            ) : (
              <View>
                <TextField label="Reply" value={text} onChangeText={setText} multiline />
                <Button
                  title="Send"
                  disabled={text.trim().length === 0}
                  loading={reply.isPending}
                  onPress={send}
                />
              </View>
            )
          }
        >
          <AppText variant="title">{ticket.subject}</AppText>
          <View style={styles.badge}>
            <Badge
              label={ticketStatusLabel(ticket.status)}
              tone={ticketStatusTone(ticket.status)}
            />
          </View>
          {messages.map((message) => {
            const mine = message.authorId === userId;
            return (
              <View key={message.id} style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <AppText variant="small" color="textMuted">
                  {mine ? 'You' : 'YoCabs support'} · {formatDateTime(message.createdAt)}
                </AppText>
                <AppText>{message.body}</AppText>
              </View>
            );
          })}
        </Screen>
      )}
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', marginVertical: spacing.sm },
  bubble: {
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    maxWidth: '90%',
  },
  mine: { backgroundColor: colors.infoSoft, alignSelf: 'flex-end' },
  theirs: { backgroundColor: colors.surface, alignSelf: 'flex-start' },
});
