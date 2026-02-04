import validator from "validator";

export interface ProviderRegisterForm {
  name: string;
  email: string;
  password: string;
  categoryId: string;
  speciality: string;
  city: string;
  hourlyPrice: string;
  address: string;
}

export const validateProvider = (form: ProviderRegisterForm) => {
  const errors: Record<string, string> = {};

  // NAME
  if (validator.isEmpty(form.name || "")) {
    errors.name = "Full name is required";
  }

  // EMAIL
  if (validator.isEmpty(form.email || "")) {
    errors.email = "Email is required";
  } else if (!validator.isEmail(form.email)) {
    errors.email = "Enter a valid email address";
  }

  // PASSWORD
  if (validator.isEmpty(form.password || "")) {
    errors.password = "Password is required";
  } else if (
    !validator.isStrongPassword(form.password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    errors.password =
      "Password must contain uppercase, lowercase, number & symbol";
  }

  // CATEGORY
  if (validator.isEmpty(form.categoryId || "")) {
    errors.categoryId = "Category is required";
  }

  // SPECIALITY
  if (validator.isEmpty(form.speciality || "")) {
    errors.speciality = "Speciality is required";
  }

  // CITY
  if (validator.isEmpty(form.city || "")) {
    errors.city = "City is required";
  }

  // HOURLY PRICE
  if (validator.isEmpty(form.hourlyPrice || "")) {
    errors.hourlyPrice = "Hourly price is required";
  } else if (!validator.isFloat(form.hourlyPrice, { min: 1 })) {
    errors.hourlyPrice = "Hourly price must be greater than 0";
  }

  // ADDRESS
  if (validator.isEmpty(form.address || "")) {
    errors.address = "Address is required";
  }

  return errors;
};



/* ================= LOGIN ================= */
export const validateLogin = (email: string, password: string) => {
  const errors: Record<string, string> = {};

  // EMAIL
  if (validator.isEmpty(email || "")) {
    errors.email = "Email is required";
  } else if (!validator.isEmail(email)) {
    errors.email = "Enter a valid email address";
  }

  // PASSWORD
  if (validator.isEmpty(password || "")) {
    errors.password = "Password is required";
  }

  return errors;
};
