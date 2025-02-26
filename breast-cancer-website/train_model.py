import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib

# Load your dataset (replace 'cancer_data.csv' with your file path)
df = pd.read_csv('data.csv')

# Show the first few rows of the dataset to ensure it's loaded correctly
print(df.head())

# Preprocess the 'diagnosis' column (convert 'M' and 'B' to 1 and 0)
label_encoder = LabelEncoder()
df['diagnosis'] = label_encoder.fit_transform(df['diagnosis'])  # 'M' -> 1, 'B' -> 0

# Define features (X) and target (y)
X = df.drop(columns=['diagnosis'])  # Drop the diagnosis column for features
y = df['diagnosis']  # Target variable (1 for malignant, 0 for benign)

# Split the data into training and testing sets (80% training, 20% testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create and train a Random Forest model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Test the model's accuracy
accuracy = model.score(X_test, y_test)
print(f'Model accuracy: {accuracy:.2f}')

# Save the trained model to a file
joblib.dump(model, 'cancer_prediction_model.pkl')
print("Model saved as 'cancer_prediction_model.pkl'.")
