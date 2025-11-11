#!/usr/bin/env bash
### INTERNAL ONLY
### Copy to apps/vscode-web/src/internal-scripts ( that directory should be gitignored ) in https://github.com/cloudflare/cloudflare-workers-editor

# Don't run script in CI environments
if [ -n "$CI" ]; then
	echo "Skipping Cloudflare WARP certs installation in CI environment"
	exit 0
fi

# Don't run script if NODE_EXTRA_CA_CERTS is not provided
# This is only needed for development
if [ -z "$NODE_EXTRA_CA_CERTS" ]; then
	echo "Skipping Cloudflare WARP certs installation"
    exit 0
fi

################################################################################
# Script to install Cloudflare trusted root cert for supported apps.
################################################################################

################################################################################
# Global variables
################################################################################

CERT_B64='LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUMyRENDQWpxZ0F3SUJBZ0lVVUxQLzNiM3BCVmE0UnhzOVdwK1FkZ2IyRHpBd0NnWUlLb1pJemowRUF3UXcKZmpFTE1Ba0dBMVVFQmhNQ1ZWTXhFekFSQmdOVkJBZ01Da05oYkdsbWIzSnVhV0V4RmpBVUJnTlZCQWNNRFZOaApiaUJHY21GdVkybHpZMjh4R0RBV0JnTlZCQW9NRDBOc2IzVmtabXhoY21Vc0lFbHVZekVvTUNZR0ExVUVBd3dmClEyeHZkV1JtYkdGeVpTQkRiM0p3YjNKaGRHVWdXbVZ5YnlCVWNuVnpkREFlRncweU16RXhNREl4TXpReU1UWmEKRncwek16RXdNekF4TXpReU1UWmFNSDR4Q3pBSkJnTlZCQVlUQWxWVE1STXdFUVlEVlFRSURBcERZV3hwWm05eQpibWxoTVJZd0ZBWURWUVFIREExVFlXNGdSbkpoYm1OcGMyTnZNUmd3RmdZRFZRUUtEQTlEYkc5MVpHWnNZWEpsCkxDQkpibU14S0RBbUJnTlZCQU1NSDBOc2IzVmtabXhoY21VZ1EyOXljRzl5WVhSbElGcGxjbThnVkhKMWMzUXcKZ1pzd0VBWUhLb1pJemowQ0FRWUZLNEVFQUNNRGdZWUFCQUFxY2Y0R0dXMmdxSXUzR1JiRGI4VkxDUGUvNm01SwpoaHBzUENET25hRDVPeE50aXRNcEV5d3EwWnRpdHpqRDZ1VnRTaEliQk82clZrVUgwd3lRTll0WGhnRzVhMXVXCkc2UWtIUm05LzVzQWU2VWRPeStVd0xXVFlvL3NWWTRMSG1JcUhrTEhDekVuYUlDOHJUbDdLNm5yVVMweDB5dVYKQUtEQVlTVzZXSlh5WEErU1JLTlRNRkV3SFFZRFZSME9CQllFRks2MENwZVZkNWs4ZlRldXd0ckJIdFRzMm1SVgpNQjhHQTFVZEl3UVlNQmFBRks2MENwZVZkNWs4ZlRldXd0ckJIdFRzMm1SVk1BOEdBMVVkRXdFQi93UUZNQU1CCkFmOHdDZ1lJS29aSXpqMEVBd1FEZ1lzQU1JR0hBa0lCaFpUelVKZmIrK1Y4cDRuMks3YW1IV2d4Qkk5bzNhalEKblJ5UUFGZ0c5MXg1eHNPVjUxK0lCZEx5Qk41R3Q0U2ZhWU0zS25pVWlTYk45MWZFa1ZsakxRQUNRUnROTDN1YQpNUGVpcWxqMUhBTDdvQjh6ZkJ1S2dRdUkrSHJPQWNweURlZHZ4UzJ1RWE5K2VTWkZuVFptb1pVV3dIVW52RUlSClY1amFGeW8zV0V5a2ZvVUYKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo='
BASE_DIR="${HOME}/.local/share/cloudflare-warp-certs"
CERT_FINGERPRINT_SHA256='91:78:4F:6F:C2:12:F0:1B:25:D2:7A:11:19:57:52:A9:65:D3:B1:E7:CF:D5:A4:5F:0A:A8:69:7B:8A:23:60:90'
ENVIRONMENT_FILE="${BASE_DIR}/config.sh"
CERT_FILE="${BASE_DIR}/CloudflareRootCertificate.pem"
CERT_FILE_DER="${BASE_DIR}/CloudflareRootCertificate.der"
CERT_FILE_COMBINED="${BASE_DIR}/CloudflareRootCertificateCombined.pem" # includes other ca-certs

mkdir -p "${BASE_DIR}"

declare -a NOT_FOUND UPDATED ERRORED_APP ERRORED_MSG

# adapted from https://go.dev/src/crypto/x509/root_linux.go?m=text
LINUX_CERT_FILES=(
	'/etc/ssl/certs/ca-certificates.crt'                # Debian/Ubuntu/Gentoo etc.
	'/etc/pki/tls/certs/ca-bundle.crt'                  # Fedora/RHEL 6
	'/etc/ssl/ca-bundle.pem'                            # OpenSUSE
	'/etc/pki/tls/cacert.pem'                           # OpenELEC
	'/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem' # CentOS/RHEL 7
	'/etc/ssl/cert.pem'                                 # Alpine Linux
)
declare LINUX_CERT_FILE

################################################################################
# Utility functions
################################################################################
die() {
	printf '%s\n' "$*" >&2
	exit 1
}

help() {
	cat <<EOF
Usage: ./$0 [-d] [app ...]

    -d: Runs script with debugging enabled. "$0 -d 2>&1 | tee /dev/tty | cf-paste" helps for sharing debug logs!

Supported apps: (defaults to all apps)
EOF
	grep '^app_' "$0" | sed -e 's/^app_/   - /' -e 's/() {$//'

	exit 0
}

add_error() {
	# since we're targeting bash3 for macOS, can't depend on associative arrays. so we make our own simplistic one
	local app="$1"
	local msg="$2"

	ERRORED_APP+=("${app}")
	ERRORED_MSG+=("${msg}")
}

ensure_cert() {
	local fp should_update
	fp=$(get_cert_fingerprint "${CERT_FILE}" 2>/dev/null)

	# we need to update if either the cert file doesn't exist, or if it doesn't match the fingerprint we expect
	if ! [[ -f "${CERT_FILE}" ]] || [[ "${CERT_FINGERPRINT_SHA256}" != "${fp}" ]]; then
		should_update=1
		base64 -d <<<"${CERT_B64}" >"${CERT_FILE}"
		UPDATED+=('root certificate')
	fi
	if ! [[ -f "${CERT_FILE_DER}" ]] || [[ -n "${should_update}" ]]; then
		openssl x509 -in "${CERT_FILE}" -inform pem -out "${CERT_FILE_DER}" -outform der
		UPDATED+=('root certificate')
	fi

	if ! [[ -f "${CERT_FILE_COMBINED}" ]]; then
		should_update=1
	fi

	# if we haven't updated the root cert, no need to regenerate the bundles
	if [[ -z "${should_update}" ]]; then
		return
	fi

	# TODO fix this to handle on trusted certs like
	# c.f. https://github.com/Homebrew/homebrew-core/blob/1cbcd166596e6b48bbde769c226f1ab928cea65d/Formula/ca-certificates.rb
	if [[ "$OSTYPE" == 'darwin'* ]]; then
		cat <(security find-certificate -a -p '/System/Library/Keychains/SystemRootCertificates.keychain' '/Library/Keychains/System.keychain') "${CERT_FILE}" >"${CERT_FILE_COMBINED}"
		UPDATED+=('combined cert bundle')
	elif [[ "$OSTYPE" == 'linux'* ]]; then
		local found
		for certFile in "${LINUX_CERT_FILES[@]}"; do
			if [[ -f "${certFile}" ]]; then
				found="${certFile}"
				break
			fi
		done
		if [[ -z "${found}" ]]; then
			die "Unable to find system CA certificates"
		fi
		cat "${found}" "${CERT_FILE}" >"${CERT_FILE_COMBINED}"
		UPDATED+=('combined cert bundle')
		LINUX_CERT_FILE="${found}"
	else
		add_error 'combined cert bundle' 'Unable to locate an appropriate public CA bundle'
	fi
}

ensure_command() {
	local cmd="$1"

	command -v "${cmd}" >/dev/null || die "${cmd} not found"
}

# check to ensure that, if the file exists, it was created by us
ensure_environment_file() {
	if [[ -f "${ENVIRONMENT_FILE}" ]]; then
		if ! grep -q '^# Managed by install-cloudflare-warp-certs script' "${ENVIRONMENT_FILE}" 2>/dev/null; then
			die "Existing cert config file found at ${ENVIRONMENT_FILE}. Please rename or remove it."
		fi
	else
		cat <<EOF >>"${ENVIRONMENT_FILE}"
# Managed by install-cloudflare-warp-certs script
EOF
	fi
}

configure_shellrc() {
	for rc in "${HOME}/.zshenv" "${HOME}/.bashrc"; do
		grep -q "${ENVIRONMENT_FILE}" "${rc}" 2>/dev/null || echo ". ${ENVIRONMENT_FILE}" >>"${rc}"
	done
}

get_cert_fingerprint() {
	local cert_path="$1"
	local algorithm="${2:-sha256}"

	openssl x509 -noout -fingerprint -"${algorithm}" -inform pem -in "${cert_path}" | cut -d'=' -f2
}

add_environment_variable() {
	local app="$1"
	local env_name="$2"
	local cert_file="${3:-CERT_FILE}"

	local marker="^# Config for ${app}"
	local line="export ${env_name}=${cert_file}"

	# if the env is present but incorrect, we need to fix it
	if ! grep -q "${line}" "${ENVIRONMENT_FILE}" && grep -q "${marker}" "${ENVIRONMENT_FILE}"; then
		sed_inplace "s,^export ${env_name}.*$,${line}," "${ENVIRONMENT_FILE}"
		UPDATED+=("${app}")
		return
	elif grep -q "${marker}" "${ENVIRONMENT_FILE}"; then
		return
	fi

	cat <<EOF >>"${ENVIRONMENT_FILE}"

# Config for ${app}
export ${env_name}=${cert_file}
EOF

	UPDATED+=("${app}")
}

configure_java_keystore() {
	local app="$1"
	local keytool="$2"
	local keystore="$3"

	local result
	result=$("${keytool}" -import -trustcacerts -alias 'Cloudflare Root CA' -file "${CERT_FILE_DER}" -keystore "${keystore}" -storepass changeit -noprompt 2>&1)

	if [[ "${result}" != *'already exists'* ]]; then
		UPDATED+=("${app}")
	fi
}

block_in_file() {
	local app="$1"
	local filepath="$2"
	local block="$3"

	if ! grep -q "${block}" "${filepath}" 2>/dev/null; then
		cat <<EOF >>"${filepath}"
# Managed by install-cloudflare-warp-certs install script
${block}
EOF
		UPDATED+=("${app}")
	fi
}

sed_inplace() {
	# sed -i works slightly different in BSD (i.e. macOS) sed and GNU sed.
	local pattern="$1"
	local file="$2"

	case "$OSTYPE" in
	darwin*)
		sed -i '' "${pattern}" "${file}"
		;;
	linux*)
		sed -i "${pattern}" "${file}"
		;;
	*)
		add_error 'sed_inplace' "unknown platform ${OSTYPE}"
		;;
	esac
}

install_required_deps() {
	apt-get -y update && apt-get install -y openssl curl ca-certificates
	local ZERO_TRUST_CERT_URL="https://gateway.security.cfdata.org/Cloudflare_Corp_Zero_Trust_Cert.pem"
	HTTP_RESPONSE=$(curl -so /etc/ssl/certs/Cloudflare_CA.pem -w %{http_code} $ZERO_TRUST_CERT_URL)

	if [ "$HTTP_RESPONSE" -ne 200 ]; then
		echo "Unable to fetch cert, please try reauthenticating by visiting https://gateway.security.cfdata.org/Cloudflare_Corp_Zero_Trust_Cert.pem" and make sure warp is enabled.
		exit 1
	fi
	chmod 777 /etc/ssl/certs/Cloudflare_CA.pem
}
################################################################################
# Applications
################################################################################

app_git() {
	if ! command -v 'git' >/dev/null; then
		NOT_FOUND+=('git')
		return
	fi
	local gitconfig="${BASE_DIR}/gitconfig"

	local before after includePath
	before=$(openssl sha256 "${gitconfig}" 2>/dev/null)
	cat <<EOF >"${gitconfig}"
# This file is included into the global gitconfig
[http]
    sslcainfo = "${CERT_FILE}"
EOF
	after=$(openssl sha256 "${gitconfig}")
	includePath=$(git config --global include.path)
	if [[ "${before}" == "${after}" ]] && [[ "${includePath}" == "${gitconfig}" ]]; then
		return
	fi

	git config --global --add include.path "${gitconfig}"
	UPDATED+=('git')
}

app_gradle() {
	if ! command -v 'keytool' >/dev/null || [[ -z "${JAVA_HOME}" ]]; then
		NOT_FOUND+=('gradle')
		return
	fi

	configure_java_keystore 'gradle' 'keytool' "${JAVA_HOME}/jre/lib/security/cacerts"
}

app_java() {
	local keytool keystore

	if command -v brew >/dev/null; then
		for jdk in "$(brew --prefix)/opt/"openjdk*; do
			# search for the two files we need
			while IFS= read -r -d '' filename; do
				if [[ "${filename}" == *'keytool' ]]; then
					keytool="${filename}"
				elif [[ "${filename}" == *'cacerts' ]]; then
					keystore="${filename}"
				fi
			done < <(find "${jdk}/" -type f \( -name cacerts -o -name keytool \) -print0 2>/dev/null)

			if [[ -n "${keytool}" ]] && [[ -n "${keystore}" ]]; then
				# not required on macOS
				if [[ "$OSTYPE" != 'darwin'* ]]; then
					cp "${keystore}" "${BASE_DIR}/bazel.keystore"
				fi
				configure_java_keystore 'java' "${keytool}" "${keystore}"
			fi
		done
	fi

	if [[ -z "${keytool}" ]] && [[ -z "${keystore}" ]]; then
		NOT_FOUND+=('java')
	fi
}

app_node() {
	# docs recommend `NODE_EXTRA_CA_CERTS` as the way to handle corporate CA certs
	add_environment_variable 'node' 'NODE_EXTRA_CA_CERTS' "${CERT_FILE_COMBINED}"
}

app_python() {
	# python's requests module looks to this env being set
	add_environment_variable 'python' 'REQUESTS_CA_BUNDLE' "${CERT_FILE_COMBINED}"

	# most of the rest of python will use certifi, which has its own CA bundles
	local PYTHON
	# last one in the list that's available takes precedence
	for python_command in python2 python python3; do
		if command -v "${python_command}" >/dev/null; then
			PYTHON="${python_command}"
		fi
	done
	if [[ -z "${PYTHON}" ]]; then
		NOT_FOUND+=('python')
		return
	fi

	local certifi_path

	certifi_path=$("${PYTHON}" -m certifi 2>/dev/null)

	if [[ -z "${certifi_path}" ]]; then
		return
	fi

	# check for the ability to write to the certifi store -- it can vary depending on how it was installed
	if ! [[ -w "${certifi_path}" ]]; then
		add_error 'python' "Unable to write to Python-certifi's store at ${certifi_path}."
		return
	fi

	# check if correct cert is already installed before appending
	if grep -q "$(sed -n '3p' "${CERT_FILE}")" "${certifi_path}"; then
		return
	fi

	cat "${CERT_FILE}" >>"${certifi_path}"
	UPDATED+=('python')
}

app_ruby() {
	# gems does its own thing
	if ! command -v 'gem' >/dev/null; then
		NOT_FOUND+=('ruby')
		return
	fi

	local gems_base
	gems_base="$(dirname "$(gem which rubygems)")/rubygems"
	if [[ "${gems_base}" == '/System/Library/Frameworks'* ]]; then
		add_error 'ruby' "Not able to update macOS system Ruby."
		return
	fi

	if ! [[ -d "${gems_base}" ]]; then
		NOT_FOUND+=('ruby')
		return
	fi

	local dest="${gems_base}/ssl_certs/rubygems.org"
	if ! [[ -f "${dest}/Cloudflare_CA.pem" ]] || ! diff "${CERT_FILE}" "${dest}/Cloudflare_CA.pem"; then
		if [[ -w "${dest}" ]]; then
			cp "${CERT_FILE}" "${dest}/Cloudflare_CA.pem"
		else
			sudo cp "${CERT_FILE}" "${dest}/Cloudflare_CA.pem"
		fi
		UPDATED+=('ruby')
	fi
}

app_rust() {
	add_environment_variable 'rust' 'CARGO_HTTP_CAINFO' "${CERT_FILE_COMBINED}"
}

################################################################################
# OS-specific functions
################################################################################

os_linux() {
	if ! grep -q "$(sed -n '3p' "${CERT_FILE}")" "${LINUX_CERT_FILE}"; then
		# shellcheck disable=SC2024
		# it's ok to open the file for reading as the current user
		tee -a "${LINUX_CERT_FILE}" >/dev/null <"${CERT_FILE}"

		UPDATED+=('linux')
		# TODO is `update-ca-certificates` or the like required?
	fi
}

################################################################################
# Reporting functions
################################################################################

report_updated() {
	if [[ "${#UPDATED[@]}" -eq 0 ]]; then
		return
	fi
	printf 'The following apps have been updated:\n'
	while IFS= read -r -d '' app; do
		printf '  - %s\n' "${app}"
	done < <(printf '%s\0' "${UPDATED[@]}" | sort -uz)
	printf '\n'
}

report_not_found() {
	if [[ "${#NOT_FOUND[@]}" -eq 0 ]]; then
		return
	fi
	printf 'The following apps were not found:\n'
	while IFS= read -r -d '' app; do
		printf '  - %s\n' "${app}"
	done < <(printf '%s\0' "${NOT_FOUND[@]}" | sort -uz)
	printf '\n'
}

report_errored() {
	if [[ "${#ERRORED_APP[@]}" -eq 0 ]]; then
		return
	fi

	printf 'The following apps were NOT successfully updated:\n'
	for ((i = 0; i < "${#ERRORED_APP[@]}"; i++)); do
		printf '  - %s: %s\n' "${ERRORED_APP[${i}]}" "${ERRORED_MSG[${i}]}"
	done
	printf '\n'
}

################################################################################
# main program
################################################################################

install_required_deps

if [[ "$1" == "-d" || "$1" == "--debug" ]]; then
	set -x
	shift 1
fi

# if no arguments, process all apps
if [[ $# == 0 ]]; then
	all=1
	set -- '*'
fi

if [[ "$1" == "-h" || "$1" == "-?" ]]; then
	help
fi

ensure_command 'openssl'
ensure_cert
ensure_environment_file
configure_shellrc

add_environment_variable 'SSL_CERT_FILE' 'SSL_CERT_FILE' "${CERT_FILE_COMBINED}"

if [[ "$OSTYPE" == linux* ]]; then
	os_linux
fi

while [[ $# -gt 0 ]]; do
	[[ $all || $1 == git ]] && app_git
	[[ $all || $1 == gradle ]] && app_gradle
	[[ $all || $1 == java ]] && app_java
	[[ $all || $1 == node ]] && app_node
	[[ $all || $1 == python ]] && app_python
	[[ $all || $1 == ruby ]] && app_ruby
	[[ $all || $1 == rust ]] && app_rust
	shift
done

printf "Setup complete. You'll need to relaunch your shell for the changes to take effect.\n"

report_errored
report_updated
report_not_found
