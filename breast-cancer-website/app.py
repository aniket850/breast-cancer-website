from flask import Flask, request, jsonify
import joblib
import numpy as np
import shap  # Import SHAP for explainability
from flask_cors import CORS  # For Cross-Origin requests

# Create Flask app
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (for frontend to interact with Flask)

# Load the trained model
model = joblib.load('cancer_prediction_model.pkl')
print("Model loaded successfully!")

# Initialize SHAP Explainer
explainer = shap.Explainer(model)  # This works with scikit-learn and tree-based models

@app.route('/')
def home():
    return "Welcome to the Breast Cancer Prediction API!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from the POST request
        data = request.json
        print("Received data:", data)  # Debugging log

        # Extract the 30 features from the incoming data
        features = list(data.values())  # Assuming the input is a dictionary with feature names as keys

        # Ensure that there are exactly 30 features
        if len(features) != 30:
            return jsonify({'error': 'Please provide all 30 features.'}), 400

        # Convert the features into a NumPy array and reshape for prediction
        features_array = np.array(features).reshape(1, -1)

        # Make a prediction using the trained model
        prediction = model.predict(features_array)[0]
        result = "Malignant" if prediction == 1 else "Benign"

        # Explain the prediction using SHAP
        shap_values = explainer(features_array)

        # Get the feature contributions (SHAP values)
        explanation = []
        for i, feature_name in enumerate(data.keys()):
            shap_value = shap_values.values[0][i]  # Extract the SHAP value for each feature
            
            # Check if shap_value is a numpy ndarray and handle it accordingly
            if isinstance(shap_value, np.ndarray):
                if shap_value.size == 1:
                    shap_value = shap_value.item()  # Convert to scalar if it's a single value array
                else:
                    shap_value = shap_value[0]  # In case the ndarray has more than one value, take the first one
                
            explanation.append(f"{feature_name}: {shap_value:.4f}")  # Format with 4 decimal places

        print(f"Prediction result: {result}")  # Debugging log
        print(f"SHAP explanation: {explanation}")  # Debugging log

        return jsonify({
            'prediction': result,
            'explanation': explanation  # Return the SHAP explanation
        })

    except Exception as e:
        print(f"Error during prediction: {e}")  # Debugging log
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
