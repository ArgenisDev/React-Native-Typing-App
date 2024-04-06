import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Button,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import prompts from './prompts';

const generatePrompt = (level: number) => prompts[level % prompts.length];

export default function TypingApp() {
  const [level, setLevel] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [levelTimes, setLevelTimes] = useState<number[]>([]);
  const [progressAnimation, setProgressAnimation] = useState(0);
  const shakeAnimation = useSharedValue(0);
  const borderColorAnimation = useSharedValue('#CCCCCC');
  const fadeInAnimation = useSharedValue(0);

  useEffect(() => {
    shakeAnimation.value = 0;
    fadeInAnimation.value = 0;
    fadeInAnimation.value = withTiming(1, {duration: 1000});
    setStartTime(new Date().getTime());
    setUserInput('');
    setProgressAnimation(0);
    setErrorCount(0);
  }, [level]);

  useEffect(() => {
    if (userInput === generatePrompt(level)) {
      const endTime = new Date().getTime();
      setLevelTimes([...levelTimes, (endTime - (startTime ?? endTime)) / 1000]);
      setLevel(level + 1);
      setUserInput('');
    }
  }, [userInput, level, startTime]);

  const handleTextChange = (text: string) => {
    if (text.length < userInput.length) {
      setUserInput(text);
      return;
    }
    const prompt = generatePrompt(level);
    setUserInput(text);

    if (!prompt.startsWith(text)) {
      setErrorCount(errorCount + 1);
      shakeAnimation.value = withSpring(-1, {}, () => {
        shakeAnimation.value = 0;
      });
      borderColorAnimation.value = withSpring('red', {}, () => {
        borderColorAnimation.value = withSpring('#CCCCCC');
      });
    }
    const correctPortionLength =
      text.length > prompt.length ? prompt.length : text.length;
    const correctPortion = prompt.substring(0, correctPortionLength);
    let correctChars = 0;

    for (let i = 0; i < correctPortionLength; i++) {
      if (text[i] === correctPortion[i]) {
        correctChars++;
      }
    }
    const progress = correctChars / prompt.length;
    setProgressAnimation(progress);
  };

  const prompt = generatePrompt(level);

  const animatedInputStyle = useAnimatedStyle(() => ({
    borderColor: borderColorAnimation.value,
    transform: [{translateX: shakeAnimation.value}],
  }));

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnimation.value,
  }));

  const averageTime =
    levelTimes.length > 0
      ? (
          levelTimes.reduce((acc, time) => acc + time, 0) / levelTimes.length
        ).toFixed(2)
      : '0';

  const renderPromptCharacters = () => {
    return prompt.split('').map((char, index) => {
      const isCorrect = index < userInput.length && userInput[index] === char;
      const isIncorrect = index < userInput.length && userInput[index] !== char;
      return (
        <Text
          key={index}
          style={[
            styles.char,
            isCorrect && styles.correct,
            isIncorrect && styles.incorrect,
          ]}>
          {char}
        </Text>
      );
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <Animated.Text style={[styles.level, fadeInStyle]}>
        Level: {level + 1}
      </Animated.Text>
      <Animated.View style={[styles.promptContainer, fadeInStyle]}>
        {renderPromptCharacters()}
      </Animated.View>
      <Animated.View
        style={[styles.inputContainer, animatedInputStyle, fadeInStyle]}>
        <TextInput
          style={styles.input}
          autoCorrect={false}
          placeholder="Start typing..."
          onChangeText={handleTextChange}
          value={userInput}
        />
      </Animated.View>
      <Text style={styles.errorCount}>Errors: {errorCount}</Text>
      <Text style={styles.time}>Average Time: {averageTime} s</Text>
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={{
            width: `${(progressAnimation ?? 0) * 100}%`,
            height: '100%',
            backgroundColor: 'blue',
          }}
        />
      </View>
      <Button
        title="Reset"
        onPress={() => {
          setLevel(0);
          setErrorCount(0);
          setLevelTimes([]);
          shakeAnimation.value = 0;
          borderColorAnimation.value = '#CCCCCC';
          setProgressAnimation(0);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  promptContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexShrink: 1,
    justifyContent: 'center',
    marginTop: 100,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },
  char: {
    fontSize: 25,
    fontFamily: 'monospace',
    margin: 2,
  },
  correct: {
    color: '#58cc02',
  },
  incorrect: {
    color: '#ff6347',
    textDecorationLine: 'underline',
  },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 30,
    padding: 15,
    marginBottom: 10,
    width: '95%',
    borderColor: '#4d8af0',
  },
  input: {
    fontSize: 18,
  },
  level: {
    fontSize: 28,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#4d8af0',
  },
  errorCount: {
    fontSize: 18,
    color: '#ff6347',
    marginTop: 10,
  },
  time: {
    marginTop: 10,
    fontSize: 18,
  },
  progressBarContainer: {
    width: '90%',
    height: 5,
    backgroundColor: '#E0E0E0',
    borderRadius: 2.5,
    marginTop: 10,
  },
});
