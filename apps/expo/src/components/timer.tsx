import type { NextPage } from "next";
import React, { useReducer, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Audio } from "expo-av";

import {
  formatTime,
  minsFromDs,
  secsFromDs,
  decisRemaining,
} from "../utils/timer";
import {
  TimerActiveStatus,
  TimerState,
  TimerActions,
} from "../constants/timer";
import type { TimerPropTypes, StateTypes, ActionTypes } from "../types/timer";

const init = (initialProps: StateTypes): StateTypes => {
  return {
    currentRep: initialProps.currentRep,
    currentSet: initialProps.currentSet,
    timer: initialProps.timer,
    activeStatus: initialProps.activeStatus,
    timerState: initialProps.timerState,
    reps: initialProps.reps,
    sets: initialProps.sets,
    repDuration: initialProps.repDuration,
    countdown: initialProps.countdown,
  };
};

const reducer = (state: StateTypes, action: ActionTypes): StateTypes => {
  switch (action.type) {
    case "START":
      return {
        ...state,
        activeStatus: TimerActiveStatus.COUNTDOWN,
        timerState: TimerState.PLAYING,
        timer: state.countdown,
      };
    case "UPDATE":
      return {
        ...state,
        timer: action.timer as number,
        activeStatus: action.activeStatus as TimerActiveStatus,
        currentRep: action.currentRep || state.currentRep,
        currentSet: action.currentSet || state.currentSet,
      };
    case "FINISH":
      return {
        ...state,
        activeStatus: TimerActiveStatus.DONE,
        timerState: TimerState.DONE,
      };
    case "TICK":
      return {
        ...state,
        timer: state.timer - 1,
      };
    case "PAUSE":
      return {
        ...state,
        timerState: TimerState.PAUSED,
      };
    case "RESUME":
      if (state.activeStatus === TimerActiveStatus.COUNTDOWN) {
        return {
          ...state,
          timer: state.countdown,
          timerState: TimerState.PLAYING,
        };
      } else {
        return {
          ...state,
          timerState: TimerState.PLAYING,
        };
      }
    case "PREV_SET":
      if (state.currentSet > 1) {
        return {
          ...state,
          timer: state.repDuration,
          activeStatus: TimerActiveStatus.COUNTDOWN,
          timerState: TimerState.PAUSED,
          currentSet: state.currentSet - 1,
          currentRep: 1,
        };
      } else {
        return state;
      }
    case "NEXT_SET":
      if (state.currentSet < state.sets) {
        return {
          ...state,
          timer: state.repDuration,
          activeStatus: TimerActiveStatus.COUNTDOWN,
          timerState: TimerState.PAUSED,
          currentSet: state.currentSet + 1,
          currentRep: 1,
        };
      } else {
        return {
          ...state,
          activeStatus: TimerActiveStatus.DONE,
          timerState: TimerState.DONE,
          timer: 0,
          currentRep: state.reps,
          currentSet: state.sets,
        };
      }
    case "PREV_REP":
      if (state.currentRep > 1) {
        return {
          ...state,
          currentRep: state.currentRep - 1,
          timer: state.repDuration,
          activeStatus: TimerActiveStatus.COUNTDOWN,
          timerState: TimerState.PAUSED,
        };
      } else if (state.currentSet > 1) {
        return {
          ...state,
          currentRep: state.reps,
          currentSet: state.currentSet - 1,
          timer: state.repDuration,
          activeStatus: TimerActiveStatus.COUNTDOWN,
          timerState: TimerState.PAUSED,
        };
      } else {
        return state;
      }
    case "NEXT_REP":
      if (state.currentRep < state.reps) {
        return {
          ...state,
          currentRep: state.currentRep + 1,
          timer: state.repDuration,
          activeStatus: TimerActiveStatus.COUNTDOWN,
          timerState: TimerState.PAUSED,
        };
      } else if (state.currentSet < state.sets) {
        return {
          ...state,
          currentRep: 1,
          currentSet: state.currentSet + 1,
          timer: state.repDuration,
          activeStatus: TimerActiveStatus.COUNTDOWN,
          timerState: TimerState.PAUSED,
        };
      } else {
        return {
          ...state,
          activeStatus: TimerActiveStatus.DONE,
          timerState: TimerState.DONE,
          timer: 0,
        };
      }
    case "RESET":
      return init(action.payload);
    default:
      throw new Error();
  }
};

const renderInstruction = (
  activeStatus: TimerActiveStatus,
  timerState: TimerState,
): string => {
  if (timerState === TimerState.PLAYING) {
    switch (activeStatus) {
      case TimerActiveStatus.COUNTDOWN:
        return "Get Ready";
      case TimerActiveStatus.REST:
        return "Rest";
      case TimerActiveStatus.WORK:
        return "Go!";
      case TimerActiveStatus.DONE:
        return "Done";
      default:
        return "";
    }
  } else if (timerState === TimerState.PAUSED) {
    return "Paused";
  } else {
    return "Play to Start";
  }
};

const getColour = (
  activeStatus: TimerActiveStatus,
  timerState: TimerState,
): string => {
  if (timerState === TimerState.PLAYING) {
    switch (activeStatus) {
      case TimerActiveStatus.COUNTDOWN:
        return "text-orange-400";
      case TimerActiveStatus.REST:
        return "text-blue-400";
      case TimerActiveStatus.WORK:
        return "text-green-400";
      case TimerActiveStatus.DONE:
        return "text-blue-500";
      default:
        return "";
    }
  } else if (timerState === TimerState.PAUSED) {
    return "text-red-400";
  } else {
    return "text-primary";
  }
};

const Timer: NextPage<TimerPropTypes> = (props) => {
  const { reps, sets, repDuration, setTitles, repsRest, setsRest } =
    props.workout;
  const initialProps = {
    currentRep: 1,
    currentSet: 1,
    timer: 0,
    activeStatus: TimerActiveStatus.INACTIVE,
    timerState: TimerState.UNSTARTED,
    reps: reps,
    sets: sets,
    repDuration: repDuration * 10,
    countdown: 50,
  };

  const [state, dispatch] = useReducer(reducer, initialProps, init);
  const [sound, setSound] = useState("");

  const handlePlayPause = () => {
    if (state.timerState === TimerState.UNSTARTED) {
      dispatch({ type: TimerActions.START });
    } else if (state.timerState === TimerState.PLAYING) {
      dispatch({ type: TimerActions.PAUSE });
    } else if (state.timerState === TimerState.PAUSED) {
      dispatch({ type: TimerActions.RESUME });
    }
  };

  const enableAudio = async () => {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeAndroid: INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      shouldDuckAndroid: false,
      allowsRecordingIOS: false,
    });
  };

  const playSound = async (url) => {
    console.log("Loading Sound");
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await enableAudio();
      setSound(sound);
      console.log("Playing Sound");
      await sound.playAsync();
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    if (state.timer > 0) {
      const interval = setInterval(() => {
        if (state.timerState === TimerState.PLAYING) {
          dispatch({ type: TimerActions.TICK });
        }
      }, 100);

      if (
        state.timer === 30 &&
        state.activeStatus === TimerActiveStatus.COUNTDOWN
      ) {
        playSound("../../assets/sounds/countdown.mp3");
      }

      return () => clearInterval(interval);
    } else if (state.activeStatus === TimerActiveStatus.COUNTDOWN) {
      // const audio = new Audio("/sounds/start.mp3");
      // audio.play();
      dispatch({
        type: TimerActions.UPDATE,
        timer: repDuration * 10,
        activeStatus: TimerActiveStatus.WORK,
      });
    } else if (state.activeStatus === TimerActiveStatus.REST) {
      let updateRep = state.currentRep;
      let updateSet = state.currentSet;
      if (updateRep < reps) {
        updateRep++;
      } else if (updateRep === reps) {
        updateRep = 1;
        if (updateSet < sets) {
          updateSet++;
        }
      }
      // const audio = new Audio("/sounds/start.mp3");
      // audio.play();
      dispatch({
        type: TimerActions.UPDATE,
        timer: repDuration * 10,
        activeStatus: TimerActiveStatus.WORK,
        currentRep: updateRep,
        currentSet: updateSet,
      });
    } else if (state.activeStatus === TimerActiveStatus.WORK) {
      if (state.currentRep < reps) {
        // const audio = new Audio("/sounds/rep_complete.mp3");
        // audio.play();
        dispatch({
          type: TimerActions.UPDATE,
          timer: repsRest * 10,
          activeStatus: TimerActiveStatus.REST,
        });
      } else if (state.currentRep === reps && state.currentSet < sets) {
        // const audio = new Audio("/sounds/set_complete.mp3");
        // audio.play();
        dispatch({
          type: TimerActions.UPDATE,
          timer: setsRest * 10,
          activeStatus: TimerActiveStatus.REST,
        });
      } else {
        // const audio = new Audio("/sounds/set_complete.mp3");
        // audio.play();
        dispatch({
          type: TimerActions.FINISH,
        });
      }
    }
  }, [state, props]);

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const CountdownText = ({ children }) => (
    <Text
      className={`text-4xl ${getColour(state.activeStatus, state.timerState)}`}
    >
      {children}
    </Text>
  );

  return (
    <View className="h-full w-full p-2">
      <View
        className={`m-6 flex flex-col content-center items-center justify-center`}
      >
        <View className="flex flex-row">
          <Text
            className={`text-4xl ${getColour(
              state.activeStatus,
              state.timerState,
            )}`}
          >
            {state.timerState === TimerState.UNSTARTED
              ? minsFromDs(repDuration * 10)
              : minsFromDs(state.timer)}
            :
            {state.timerState === TimerState.UNSTARTED
              ? secsFromDs(repDuration * 10)
              : secsFromDs(state.timer)}
          </Text>
          <Text
            className={`text-sm ${getColour(
              state.activeStatus,
              state.timerState,
            )}`}
          >
            {state.timerState === TimerState.UNSTARTED
              ? "0"
              : decisRemaining(state.timer)}
          </Text>
        </View>
        <Text>{renderInstruction(state.activeStatus, state.timerState)}</Text>
      </View>
      <View className="center-items flex flex-row justify-between">
        <Text className="m-2 flex flex-row items-center rounded bg-slate-200 p-2 text-slate-900">
          <Text className="text-sm">Rep: </Text>
          <Text>
            {state.currentRep} / {reps}
          </Text>
        </Text>
        {setTitles && (
          <Text className="m-2 flex flex-row items-center text-lg">
            <Text>{setTitles[state.currentSet - 1]}</Text>
          </Text>
        )}
        <Text className="m-2 flex flex-row items-center rounded bg-slate-200 p-2 text-slate-900">
          <Text className="text-sm">Set: </Text>
          <Text>
            {state.currentSet} / {sets}
          </Text>
        </Text>
      </View>
      <View className="flex flex-row justify-between">
        <Text className="m-2 flex flex-col items-center rounded bg-slate-100 p-2 text-xs text-slate-800">
          <Text>Work</Text>
          <Text>{formatTime(repDuration)}</Text>
        </Text>
        <Text className="m-2 flex flex-col items-center rounded bg-slate-100 p-2 text-xs text-slate-800">
          <Text>Rep Rest</Text>
          <Text>{formatTime(repsRest)}</Text>
        </Text>
        <Text className="m-2 flex flex-col items-center rounded bg-slate-100 p-2 text-xs text-slate-800">
          <Text>Set Rest</Text>
          <Text>{formatTime(setsRest)}</Text>
        </Text>
      </View>

      <View className="m-2 flex flex-row justify-between">
        <TouchableOpacity onPress={() => dispatch({ type: "PREV_SET" })}>
          <Ionicons name="play-skip-back" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => dispatch({ type: "PREV_REP" })}>
          <Ionicons name="play-back" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => dispatch({ type: "NEXT_REP" })}>
          <Ionicons name="play-forward" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => dispatch({ type: "NEXT_SET" })}>
          <Ionicons name="play-skip-forward" />
        </TouchableOpacity>
      </View>
      <View className="m-2 flex flex-row justify-between space-x-2">
        <TouchableOpacity
          className="w-1/2 rounded-xl bg-green-500 py-2 px-4 font-bold text-white hover:bg-green-700"
          onPress={handlePlayPause}
        >
          {state.timerState === TimerState.PLAYING ? (
            <Ionicons name="pause" />
          ) : (
            <Ionicons name="play" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          className="w-1/2 rounded-xl bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
          onPress={() => {
            dispatch({ type: TimerActions.RESET, payload: initialProps });
          }}
        >
          <Ionicons name="refresh" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Timer;
