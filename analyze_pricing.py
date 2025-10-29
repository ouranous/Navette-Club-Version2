import numpy as np
from sklearn.linear_model import LinearRegression

# Données de Carthage Transfer
data = {
    'distance_km': [16.9, 8.7, 6.6, 76.8, 71.2, 334.6],
    'time_min': [26, 14, 12, 66, 57, 293],
    'price_eur': [26.93, 23.57, 22.71, 51.49, 49.19, 158.84]
}

# Préparer les données
X = np.array([[d, t] for d, t in zip(data['distance_km'], data['time_min'])])
y = np.array(data['price_eur'])

# Régression linéaire
model = LinearRegression()
model.fit(X, y)

# Extraire les coefficients
base_fee = model.intercept_
price_per_km = model.coef_[0]
price_per_min = model.coef_[1]

print("=" * 60)
print("FORMULE DE CARTHAGE TRANSFER")
print("=" * 60)
print(f"\nPrix de base : {base_fee:.2f} €")
print(f"Prix par km : {price_per_km:.2f} €/km")
print(f"Prix par minute : {price_per_min:.2f} €/min")

print("\n" + "=" * 60)
print("FORMULE COMPLÈTE :")
print("=" * 60)
print(f"Prix = {base_fee:.2f} + ({price_per_km:.2f} × distance_km) + ({price_per_min:.2f} × temps_min)")

print("\n" + "=" * 60)
print("VÉRIFICATION DES PRÉDICTIONS")
print("=" * 60)
print(f"{'Distance':<12} {'Temps':<12} {'Prix réel':<15} {'Prix prédit':<15} {'Écart':<10}")
print("-" * 70)

for i in range(len(data['distance_km'])):
    distance = data['distance_km'][i]
    time = data['time_min'][i]
    real_price = data['price_eur'][i]
    predicted_price = model.predict([[distance, time]])[0]
    diff = abs(real_price - predicted_price)
    
    print(f"{distance:<12.1f} {time:<12} {real_price:<15.2f} {predicted_price:<15.2f} {diff:<10.2f}")

# Coefficient de détermination (R²)
from sklearn.metrics import r2_score
r2 = r2_score(y, model.predict(X))
print("\n" + "=" * 60)
print(f"Précision du modèle (R²) : {r2:.4f}")
print(f"(1.0000 = parfait, >0.95 = excellent)")
print("=" * 60)

# Test avec différentes configurations
print("\n" + "=" * 60)
print("EXEMPLES DE CALCUL")
print("=" * 60)

test_cases = [
    (20, 30, "Court trajet urbain"),
    (50, 45, "Trajet moyen"),
    (100, 90, "Long trajet"),
]

for distance, time, description in test_cases:
    predicted = model.predict([[distance, time]])[0]
    print(f"\n{description}:")
    print(f"  Distance: {distance} km, Temps: {time} min")
    print(f"  Prix estimé: {predicted:.2f} €")
