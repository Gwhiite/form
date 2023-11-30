import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "./lib/supabase";

const createUserFormSchema = z.object({
  avatar: z
    .instanceof(FileList)
    .transform((list) => list.item(0)!)
    .refine(
      (file) => file!.size <= 5 * 1024 * 1024,
      "O arquvo precisa ter no máximo 5mb"
    ),
  name: z
    .string()
    .nonempty("O nome é obrigatório")
    .transform((name) => {
      return name
        .trim()
        .split(" ")
        .map((word) => {
          return word[0].toLocaleUpperCase().concat(word.substring(1));
        })
        .join(" ");
    }),
  email: z
    .string()
    .nonempty("O e-mail é obrigatório")
    .email("Formato de e-mail inválido")
    .toLowerCase()
    .refine((email) => {
      return email.endsWith("@gmail.com");
    }, "O e-mail tem que ser do Google"),
  password: z.string().min(6, "A senha necessita no mínimo 6 caracteres"),
  techs: z
    .array(
      z.object({
        title: z.string().nonempty("O título é obrigatório"),
        knowledge: z.coerce.number().min(1).max(100),
      })
    )
    .min(2, "Insira pelo menos duas tecnologias")
    .refine((techs) => {
      return techs.some((tech) => tech.knowledge > 50);
    }, "Tu é um jumento aparentemente"),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;

function App() {
  const [output, setOutput] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    name: "techs",
    control,
  });

  const addNewTech = () => {
    append({ title: "", knowledge: 0 });
  };

  const createUser = async (data: CreateUserFormData) => {
    await supabase.storage
      .from("fileUpload")
      .upload(data.avatar.name, data.avatar);
    setOutput(JSON.stringify(data, null, 2));
  };

  return (
    <main className="h-screen bg-zinc-950 text-zinc-300 flex flex-col gap-10 items-center justify-center">
      <form
        onSubmit={handleSubmit(createUser)}
        className="flex flex-col gap-4 w-full max-w-xs"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="Avatar">Avatar</label>
          <input
            accept="image/*"
            {...register("avatar")}
            type="file"
            id="file"
          />
          {errors.avatar && (
            <span className="text-red-500 text-sm">
              {errors.avatar.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">E-mail</label>
          <input
            {...register("email")}
            className="bg-zinc-800 border border-zinc-600 shadow-sm rounded h-10 outline-none px-3 focus:outline-1 focus:outline-purple-800 text-purple-800"
            type="email"
            id="email"
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="name">Nome</label>
          <input
            {...register("name")}
            className="bg-zinc-800 border border-zinc-600 shadow-sm rounded h-10 outline-none px-3 focus:outline-1 focus:outline-purple-800 text-purple-800"
            type="text"
            id="name"
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password">Senha</label>
          <input
            {...register("password")}
            className="bg-zinc-800 border border-zinc-600 shadow-sm rounded h-10 outline-none px-3 focus:outline-1 focus:outline-purple-800 text-purple-800"
            type="password"
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="" className="flex items-center justify-between">
            Tecnologias{" "}
            <button
              type="button"
              className="text-emerald-500 text-sm"
              onClick={addNewTech}
            >
              Adicionar
            </button>{" "}
          </label>

          {fields.map((field, index) => {
            return (
              <div className="flex gap-2" key={field.id}>
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    {...register(`techs.${index}.title`)}
                    className=" bg-zinc-800 border border-zinc-600 shadow-sm rounded h-10 outline-none px-3 focus:outline-1 focus:outline-purple-800 text-purple-800"
                    type="text"
                  />

                  {errors.techs?.[index]?.title && (
                    <span className="text-red-500 text-sm">
                      {errors.techs?.[index]?.title.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    {...register(`techs.${index}.knowledge`)}
                    className="flex-1 w-16 bg-zinc-800 border border-zinc-600 shadow-sm rounded h-10 outline-none px-3 focus:outline-1 focus:outline-purple-800 text-purple-800"
                    type="number"
                  />

                  {errors.techs?.[index]?.knowledge && (
                    <span className="text-red-500 text-sm">
                      {errors.techs?.[index]?.knowledge.message}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {errors.techs && (
            <span className="text-red-500 text-sm">{errors.techs.message}</span>
          )}
        </div>

        <button
          className="bg-emerald-500 rounded font-semibold text-white h-10 hover:bg-emerald-600"
          type="submit"
        >
          Salvar
        </button>
      </form>
      <pre>{output}</pre>
    </main>
  );
}

export default App;
