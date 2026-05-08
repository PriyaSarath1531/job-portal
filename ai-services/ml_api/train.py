import argparse
import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--csv", required=True, help="Path to labeled_profiles.csv")
    p.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "model.joblib"))
    args = p.parse_args()

    df = pd.read_csv(args.csv)
    if "label" not in df.columns:
        raise SystemExit("CSV must include a 'label' column (0/1/2)")

    feature_cols = [c for c in df.columns if c != "label"]
    X = df[feature_cols].astype("float32")
    y = df["label"].astype("int64")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        class_weight="balanced",
        max_depth=None,
    )
    model.fit(X_train, y_train)
    acc = model.score(X_test, y_test)
    print(f"Test accuracy: {acc:.4f}")

    joblib.dump({"model": model, "feature_order": feature_cols}, args.out)
    print(f"Saved model to: {args.out}")


if __name__ == "__main__":
    main()

