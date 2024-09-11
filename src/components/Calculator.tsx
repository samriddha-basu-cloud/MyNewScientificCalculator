import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Animated, Dimensions, TextInput } from 'react-native';

const Calculator = () => {
    const [display, setDisplay] = useState('');
    const [result, setResult] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(1));
    const [cursorPosition, setCursorPosition] = useState<number>(0); // Track cursor position

    useEffect(() => {
        const updateOrientation = () => {
            const { width, height } = Dimensions.get('window');
            setIsLandscape(width > height);
        };

        const subscription = Dimensions.addEventListener('change', updateOrientation);
        updateOrientation();

        return () => {
            subscription.remove();
        };
    }, []);

    const handlePress = (value: string) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 100, useNativeDriver: true })
        ]).start();

        if (value === '=') {
            try {
                // Automatically close any unclosed parentheses
                let balancedDisplay = display;
                const openBrackets = (display.match(/\(/g) || []).length;
                const closeBrackets = (display.match(/\)/g) || []).length;
                if (openBrackets > closeBrackets) {
                    balancedDisplay += ')'.repeat(openBrackets - closeBrackets);
                }

                // Replace 'x' with '*' for evaluation
                let evalExpression = balancedDisplay
                    .replace(/x/g, '*')
                    .replace(/÷/g, '/')
                    .replace(/π/g, Math.PI.toString())
                    .replace(/e/g, Math.E.toString())
                    .replace(/√/g, 'Math.sqrt')
                    .replace(/log\(/g, 'Math.log10(')
                    .replace(/ln\(/g, 'Math.log(')
                    .replace(/exp\(/g, 'Math.exp(')
                    .replace(/∛/g, 'Math.cbrt')
                    .replace(/(\d+)\²/g, 'Math.pow($1, 2)')
                    .replace(/(\d+)\³/g, 'Math.pow($1, 3)');

                // Convert degrees to radians for trig functions
                evalExpression = evalExpression.replace(/sin\(([^)]+)\)/g, (_, expr) => `Math.sin((${expr}) * Math.PI / 180)`);
                evalExpression = evalExpression.replace(/cos\(([^)]+)\)/g, (_, expr) => `Math.cos((${expr}) * Math.PI / 180)`);
                evalExpression = evalExpression.replace(/tan\(([^)]+)\)/g, (_, expr) => `Math.tan((${expr}) * Math.PI / 180)`);

                // Evaluate result
                const evalResult = eval(evalExpression).toString();
                setResult(evalResult);
                const newHistory = [`${display} = ${evalResult}`, ...history.slice(0, 4)];
                setHistory(newHistory);
            } catch (e) {
                setResult('Error');
            }
        } else if (value === 'C') {
            setDisplay('');
            setResult('');
        } else if (value === '⌫') {
            if (cursorPosition > 0) {
                const newDisplay = display.slice(0, cursorPosition - 1) + display.slice(cursorPosition);
                setDisplay(newDisplay);
                setCursorPosition(cursorPosition - 1);
            }
        } else if (value === '%') {
            const percentage = parseFloat(display) / 100;
            setDisplay(percentage.toString());
        } else if (value === '∛') {
            const newDisplay = `∛(${display})`;
            setDisplay(newDisplay);
        } else if (value === 'x!') {
            const number = parseInt(display);
            const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));
            setDisplay(factorial(number).toString());
        } else if (['sin', 'cos', 'tan', 'sqrt', 'log', 'ln', 'exp', 'π', 'e', 'x²', 'x³', '1/x'].includes(value)) {
            let expression = display;
            switch (value) {
                case 'sin': expression += 'sin('; break;
                case 'cos': expression += 'cos('; break;
                case 'tan': expression += 'tan('; break;
                case 'sqrt': expression += '√('; break; // Use square root symbol
                case 'log': expression += 'log('; break;
                case 'ln': expression += 'ln('; break;
                case 'exp': expression += 'exp('; break;
                case 'π': expression += 'π'; break;
                case 'e': expression += 'e'; break;
                case 'x²': expression += '²'; break; // Use superscript 2
                case 'x³': expression += '³'; break; // Use superscript 3
                case '1/x': expression = `1/(${expression})`; break;
            }
            setDisplay(expression);
        } else {
            const newDisplay = display.slice(0, cursorPosition) + value + display.slice(cursorPosition);
            setDisplay(newDisplay);
            setCursorPosition(cursorPosition + 1);
        }
    };

    const portraitButtons = [
        ['C', '(', ')', '÷'],
        ['7', '8', '9', 'x'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '+'],
        ['0', '.', '⌫', '=']
    ];

    const landscapeButtons = [
        ['sin', 'cos', 'tan', 'C', '(', ')', '÷'],
        ['%', '∛', 'x!', '7', '8', '9', 'x'],
        ['sqrt', 'log', 'ln', '4', '5', '6', '-'],
        ['exp', 'π', 'e', '1', '2', '3', '+'],
        ['x²', 'x³', '1/x', '0', '.', '⌫', '=']
    ];

    const renderButton = (value: string) => (
        <TouchableOpacity
            key={value}
            style={[
                styles.button,
                value === '=' ? styles.equalButton : null,
                ['C', '(', ')', '÷', 'x', '-', '+'].includes(value) ? styles.operatorButton : null,
                ['sin', 'cos', 'tan', 'sqrt', 'log', 'ln', 'exp', 'π', 'e', 'x²', 'x³', '1/x', '%', '∛', 'x!'].includes(value) ? styles.scientificButton : null
            ]}
            onPress={() => handlePress(value)}
        >
            <Animated.Text style={[styles.buttonText, { opacity: fadeAnim }]}>{value}</Animated.Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.calculatorContainer}>
            <View style={styles.topBar}>
                <Text style={styles.modeText}>{isLandscape ? 'Scientific Mode' : 'Standard Mode'}</Text>
                <TouchableOpacity onPress={() => setIsHistoryVisible(true)}>
                    <Text style={styles.historyIcon}>⏱️</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.displayContainer}>
                <TextInput
                    style={styles.displayText}
                    value={display}
                    onChangeText={(text) => setDisplay(text)}
                    onSelectionChange={({ nativeEvent: { selection: { start } } }) => setCursorPosition(start)} // Update cursor position
                    showSoftInputOnFocus={false} // Disable keyboard to keep control over input
                    multiline
                    scrollEnabled
                />
                <Text style={styles.resultText}>{result}</Text>
            </View>
            <View style={styles.buttonContainer}>
                {(isLandscape ? landscapeButtons : portraitButtons).map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((button) => renderButton(button))}
                    </View>
                ))}
            </View>

            <Modal
                visible={isHistoryVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsHistoryVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>History</Text>
                        <ScrollView style={styles.historyList}>
                            {history.map((item, index) => (
                                <Text key={index} style={styles.historyItem}>{item}</Text>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setIsHistoryVisible(false)}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    calculatorContainer: {
        flex: 1,
        backgroundColor: '#202020',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#333',
    },
    modeText: {
        color: '#fff',
        fontSize: 16,
    },
    historyIcon: {
        fontSize: 24,
    },
    displayContainer: {
        flex: 2,
        justifyContent: 'flex-end',
        padding: 20,
    },
    displayText: {
        color: '#fff',
        fontSize: 40,
        textAlign: 'right',
        minHeight: 70, // Ensures enough space for multiple lines
    },
    resultText: {
        color: '#888',
        fontSize: 30,
        textAlign: 'right',
    },
    buttonContainer: {
        flex: 3,
        padding: 10,
    },
    row: {
        flex: 1,
        flexDirection: 'row',
    },
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        borderRadius: 50,
        backgroundColor: '#333',
    },
    equalButton: {
        backgroundColor: '#4CAF50',
    },
    operatorButton: {
        backgroundColor: '#FF9800',
    },
    scientificButton: {
        backgroundColor: '#607D8B',
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#333',
        borderRadius: 10,
        padding: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
    },
    historyList: {
        maxHeight: 200,
        marginBottom: 15,
    },
    historyItem: {
        fontSize: 18,
        color: '#fff',
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default Calculator;