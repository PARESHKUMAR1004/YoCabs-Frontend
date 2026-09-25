import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useSubmitReview } from '@/features/tourist/hooks';
import { AppText, Button, RatingInput, Screen, Spacer, TextField } from '@/shared/ui';
import { showError, showInfo } from '@/shared/utils/feedback';

export default function ReviewTrip() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const submit = useSubmitReview(id);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const onSubmit = () =>
    submit.mutate(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          showInfo('Thank you', 'Your review helps other travellers.');
          router.back();
        },
        onError: (error) => showError(error, 'Could not submit your review'),
      },
    );

  return (
    <Screen
      footer={
        <Button
          title="Submit review"
          disabled={rating === 0}
          loading={submit.isPending}
          onPress={onSubmit}
        />
      }
    >
      <AppText variant="title">How was your trip?</AppText>
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
