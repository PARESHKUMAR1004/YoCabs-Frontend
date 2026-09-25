import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AppText, Button, ChoiceChips, FormTextField, Screen } from '@/shared/ui';
import { requiredText } from '@/shared/forms/zod';
import { showError } from '@/shared/utils/feedback';
import { useOpenTicket } from './hooks';
import { TICKET_CATEGORY_OPTIONS } from './labels';

const schema = z.object({
  category: z.enum([
    'BOOKING_ISSUE',
    'PAYMENT_ISSUE',
    'DRIVER_ISSUE',
    'CANCELLATION_REFUND',
    'SAFETY',
    'OTHER',
  ]),
  subject: requiredText('Subject', 120),
  description: requiredText('Description', 2000),
});
type Form = z.input<typeof schema>;

interface Props {
  bookingId?: string;
  /** `SAFETY` for the driver's SOS entry point. */
  defaultCategory?: Form['category'];
  onCreated: (ticketId: string) => void;
}

export function NewTicketScreen({
  bookingId,
  defaultCategory = 'BOOKING_ISSUE',
  onCreated,
}: Props) {
  const open = useOpenTicket();
  const { control, handleSubmit } = useForm<Form, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { category: defaultCategory, subject: '', description: '' },
  });

  const onSubmit = handleSubmit((values) =>
    open.mutate(
      { ...values, bookingId },
      {
        onSuccess: (ticket) => onCreated(ticket.ticket.id),
        onError: (error) => showError(error, 'Could not send your request'),
      },
    ),
  );

  return (
    <Screen
      footer={
        <Button
          title="Send"
          loading={open.isPending}
          onPress={() => void onSubmit()}
          testID="send-ticket"
        />
      }
    >
      <AppText variant="caption" color="textMuted">
        What is this about?
      </AppText>
      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <ChoiceChips
            horizontal={false}
            options={TICKET_CATEGORY_OPTIONS}
            value={field.value}
            onChange={(value) => value && field.onChange(value)}
          />
        )}
      />
      <FormTextField control={control} name="subject" label="Subject" />
      <FormTextField control={control} name="description" label="Tell us what happened" multiline />
    </Screen>
  );
}
