#!/usr/bin/env ruby

require "optparse"
require "ostruct"
require "ecdsa"
require "digest/sha1"
require "digest/sha2"


def create_signature(sig_str)
  r = sig_str[0..31].to_i(16)
  s = sig_str[32..63].to_i(16)
  ECDSA::Signature.new(r, s)
end

def create_point(pubk_str)
  pubk_str = pubk_str[2..-1] # Skip first 2 chars ('04')
  x = pubk_str[0..31].to_i(16)
  y = pubk_str[32..63].to_i(16)
  ECDSA::Group::Secp128r1.new_point([x, y])
end


def parse(args)
  options = OpenStruct.new
  options.pubk       = nil
  options.digest     = nil
  options.signature  = nil

  parser = OptionParser.new do |opts|
    opts.banner = "Usage: verify_sig [options]"

    opts.separator ""
    opts.separator "Specific options:"

    opts.on("-k", "--public-key PUBKEY", "The public key") do |pubk|
      options.pubk = pubk
    end

    opts.on("-d", "--digest DIGEST", "The digest") do |digest|
      options.digest = digest
    end

    opts.on("-s", "--signature SIGNATURE", "The signature") do |signature|
      options.signature = signature
    end

    opts.separator ""
    opts.separator "Common options:"

    # No argument, shows at tail.  This will print an options summary.
    # Try it and see!
    opts.on_tail("-h", "--help", "Show this message") do
      puts opts
      exit
    end

  end

  parser.parse!(args)

  [parser, options]
end


def main
  parser, options = parse ARGV

  unless options.pubk =~ /^04[a-zA-Z0-9]{64}$/
    puts "Invalid public key\n"
    puts parser.help
    exit(-1)
  end
  unless options.digest =~ /^[a-zA-Z0-9]{14}$/
    puts "Invalid digest\n"
    puts parser.help
    exit(-1)
  end
  unless options.signature =~ /^[a-zA-Z0-9]{64}$/
    puts "Invalid signature\n"
    puts parser.help
    exit(-1)
  end

  pubk = create_point options.pubk
  digest = options.digest.to_i(16)
  signature = create_signature options.signature

  #puts "--> PubKey ".ljust(50, "-")
  #puts "X:     #{pubk.x}"
  #puts "Y:     #{pubk.y}"
  #puts "Valid: #{ECDSA::Group::Secp128r1.valid_public_key?(pubk)}"

  #puts "--> Digest ".ljust(50, "-")
  #puts "Value: #{digest}"

  #puts "--> Signature ".ljust(50, "-")
  #puts "R:     #{signature.r}"
  #puts "S:     #{signature.s}"
  #puts "Valid: #{ECDSA.valid_signature?(pubk, digest, signature)}"
  puts "#{ECDSA.valid_signature?(pubk, digest, signature)}"

end

main
