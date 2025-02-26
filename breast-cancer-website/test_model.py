import joblib
import numpy as np

# Load the saved model
model = joblib.load('cancer_prediction_model.pkl')

# Example input (replace with real data)
example_input = np.array([[23.99, 15.38, 127.8, 1007.0, 0.1184]])

# Make a prediction
prediction = model.predict(example_input)
print("Prediction:", "Cancerous" if prediction[0] == 1 else "Non-Cancerous")
