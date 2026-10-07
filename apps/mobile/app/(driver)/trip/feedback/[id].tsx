import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSubmitTouristFeedback } from '@/features/driver/hooks';
import { AppText, Button, RatingInput, Screen, Spacer, TextField } from '@/shared/ui';
import { showError, showInfo } from '@/shared/utils/feedback';

export default function RateTraveller() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const submit = useSubmitTouristFeedback(id);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const onSubmit = () =>
    submit.mutate(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          showInfo('Thank you', 'Your feedback has been recorded.');
          router.back();
        },
        onError: (error) => showError(error, 'Could not submit feedback'),
      },
    );

  return (
    <Screen
      footer={
        <Button
          title="Submit feedback"
          disabled={rating === 0}
          loading={submit.isPending}
          onPress={onSubmit}
        />
      }
    >
      <AppText variant="title">How was the traveller?</AppText>
      <Spacer />
      <RatingInput value={rating} onChange={setRating} />
      <Spacer />
      <TextField
        label="Comments (optional)"
        value={comment}
        onChangeText={setComment}
        multiline
        maxLength={500}
      />
    </Screen>
  );
}
