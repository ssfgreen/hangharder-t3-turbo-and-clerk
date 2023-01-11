import { Text, View, Button, TouchableOpacity, Form } from "react-native";
import { trpc } from "../utils/trpc";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Slider from "@mui/material/Slider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  Controller,
  useForm,
  FormProvider,
  useFormContext,
  SubmitHandler,
  FieldValues,
} from "react-hook-form";

interface LogProps {
  id: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const schema = z.object({
  dateLogged: z.date(),
  completePerc: z.number().optional(),
  weight: z.number().optional(),
  comment: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

export function LogScreen({ route, navigation }) {
  // const { data: workout } = trpc.workout.byId.useQuery(route.p.id);
  console.log(route);
  const workout = route.params.workout;
  const mutation = trpc.log.insertOne.useMutation();

  const methods = useForm<Schema>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (mutation.isSuccess) {
      setIsOpen(false);
      methods.reset();
    }
  }, [mutation.isSuccess, methods, setIsOpen]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    console.log(data);
    // const mutationObj = {
    //   exerciseId: props.id,
    //   dateLogged: data.dateLogged,
    //   ...data,
    // };

    // mutation.mutate(mutationObj);
  };

  if (!workout) {
    return (
      <View>
        <Text>Loading Log</Text>
      </View>
    );
  }

  return (
    <View className="h-full w-full space-y-2 overflow-auto p-2">
      <FormProvider {...methods}>
        <View className="my-4 mx-auto h-full w-3/4">
          <NestedInput />
          <Button
            onPress={methods.handleSubmit(onSubmit)}
            title="Submit"
            color="#841584"
          />
        </View>
      </FormProvider>
    </View>
  );
}

const NestedInput = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<Schema>();

  const [reqDate, setreqDate] = useState(new Date());

  return (
    <div>
      <section className="my-2 flex flex-col">
        <label>Date</label>
        <Controller
          name="dateLogged"
          defaultValue={reqDate}
          control={control}
          // render={({ field: { onChange, ...rest } }) => (
          render={({ field: { ref, onBlur, name, ...field }, fieldState }) => (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                {...field}
                inputRef={ref}
                onChange={(event) => {
                  !!event && field.onChange(new Date(event));
                  !!event && setreqDate(event);
                }}
                // label="Date"/
                inputFormat="DD/MM/YYYY"
                renderInput={(inputProps) => (
                  <TextField
                    {...inputProps}
                    onBlur={onBlur}
                    name={name}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </LocalizationProvider>
          )}
        />
      </section>
      <section className="my-2">
        <label>Percent Completed</label>
        <Controller
          name="completePerc"
          control={control}
          defaultValue={100}
          render={({ field }) => (
            <Slider
              {...field}
              onChange={(_, value) => {
                field.onChange(value);
              }}
              max={100}
              step={10}
            />
          )}
        />
      </section>
      <section className="my-2">
        <label>Weight Added / Removed</label>
        <input
          type="number"
          defaultValue={0}
          className="w-full rounded border-[0.4px] border-black/70 bg-transparent p-2"
          {...register("weight", { valueAsNumber: true })}
        />
      </section>
      <section className="my-2 flex flex-col">
        <label>Comment</label>
        <Controller
          render={({ field }) => <TextField {...field} />}
          name="comment"
          control={control}
        />
      </section>
    </div>
  );
};
