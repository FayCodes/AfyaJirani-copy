import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import numpy as np
import joblib

cases = pd.read_csv('cases.csv')
cases['date'] = pd.to_datetime(cases['date'])
diseases = cases['disease'].dropna().unique().tolist()

for disease in diseases:
    print(f'Training model for {disease}...')
    df = cases[cases['disease'] == disease]
    daily = df.groupby('date').size().reset_index(name='case_count')
    daily = daily.sort_values('date')
    daily['days_since_start'] = (daily['date'] - daily['date'].min()).dt.days
    days = daily[['days_since_start']].values
    counts = daily['case_count'].values
    if len(days) < 2:
        print(f'Not enough data for {disease}, skipping.')
        continue
    X_train, X_test, y_train, y_test = train_test_split(days, counts, test_size=0.2, random_state=42)
    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    print(f"{disease} Test MSE: {mse:.2f}")
    joblib.dump({
        'model': model,
        'start_date': daily['date'].min()
    }, f'model_{disease}.pkl')
    print(f"Model for {disease} saved as model_{disease}.pkl")

with open('diseases.txt', 'w') as f:
    for d in diseases:
        f.write(f"{d}\n")
print('Disease list saved to diseases.txt') 