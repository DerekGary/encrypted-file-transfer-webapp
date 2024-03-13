import os
import sys

def combine_project_files(root_dir, output_file):
    print(f"Combining project files from {root_dir} into {output_file}")
    file_count = 0  # Counter for the number of files processed
    excluded_dirs = {'node_modules', 'venv', '__pycache__', 'build'}  # Directories to exclude
    allowed_extensions = (".py", ".conf", ".yml", ".html", ".js", ".css")  # Allowed file extensions

    with open(output_file, "w", encoding='utf-8') as outfile:
        for dirpath, dirnames, filenames in os.walk(root_dir):
            # Exclude specified directories
            dirnames[:] = [d for d in dirnames if d not in excluded_dirs]

            for filename in filenames:
                if filename.endswith(allowed_extensions):
                    filepath = os.path.join(dirpath, filename)
                    print(f"Processing file: {filepath}")  # Diagnostic print
                    try:
                        with open(filepath, "r", encoding='utf-8') as infile:
                            outfile.write(f"### File: {filepath}\n\n")
                            outfile.write(infile.read())
                            outfile.write("\n\n")
                            file_count += 1
                    except IOError as e:
                        print(f"Error opening or reading file {filepath}: {e}")

    if file_count == 0:
        print("No files were processed. Please check your directory path and file extensions.")
    else:
        print(f"Successfully processed {file_count} files.")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        root_dir = sys.argv[1]  # Use the first command-line argument as the root directory
        output_file = sys.argv[2]  # Use the second command-line argument as the output file
    else:
        print("Usage: python script.py <root_dir> <output_file>")
        sys.exit(1)

    combine_project_files(root_dir, output_file)
